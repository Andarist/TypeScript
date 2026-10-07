package checker

import (
	"maps"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/scanner"
)

type recursiveTypeFrame struct {
	name                 *ast.Node
	body                 *ast.Node
	enclosingDeclaration *ast.Node
	path                 *recursiveTypePath
	type_                *Type
}

// Keep path tracking cheap for acyclic types. Entity-name nodes are allocated
// only when an actual back edge needs a reference to the output declaration.
type recursiveTypePath struct {
	parent *recursiveTypePath
	name   string
}

func (b *NodeBuilderImpl) recursiveTypeIdentity(t *Type) TypeId {
	if b.ch.isArrayOrTupleType(t) {
		return b.ch.createTypeReference(t.Target(), b.ch.getTypeArguments(t)).id
	}
	return t.id
}

// Called only after serialization encounters an actual back edge. A nameable
// declaration remains preferable to introducing a new recursive type alias.
func (b *NodeBuilderImpl) tryCreateRecursiveTypeReference(t *Type) *ast.Node {
	frame := b.ctx.recursiveTypeFrames[b.recursiveTypeIdentity(t)]
	if frame == nil {
		return nil
	}
	if reference := b.tryCreateRecursiveDeclarationReference(t); reference != nil {
		b.ctx.recursiveTypeReferenceUsed = true
		return reference
	}
	if frame.name == nil {
		name := "recursive"
		for enclosing := b.ctx.enclosingDeclaration; enclosing != nil && !ast.IsSourceFile(enclosing); enclosing = enclosing.Parent {
			if enclosing.Name() != nil && ast.IsIdentifier(enclosing.Name()) {
				name = enclosing.Name().Text()
				break
			}
		}
		frame.name = b.e.Factory.NewUniqueNameEx(name+"_recursive", printer.AutoGenerateOptions{Flags: printer.GeneratedIdentifierFlagsOptimistic})
		b.ctx.recursiveTypeHelpers = append(b.ctx.recursiveTypeHelpers, frame)
	}
	b.ctx.recursiveTypeReferenceUsed = true
	b.ctx.approximateLength += len(frame.name.Text())
	return b.f.NewTypeReferenceNode(b.f.DeepCloneNode(frame.name), nil)
}

// Extend an output path only while emitting a required, public property signature.
// Optional properties include undefined, and a class's structural constructor
// declaration need not retain the checker's synthetic prototype property.
func (b *NodeBuilderImpl) recursiveTypePathForProperty(property *ast.Symbol, name *ast.Node) *recursiveTypePath {
	frame := b.ctx.recursiveTypeCurrentFrame
	if frame == nil || frame.path == nil || property.Flags&ast.SymbolFlagsOptional != 0 ||
		!(ast.IsIdentifier(name) || ast.IsStringLiteral(name)) || !scanner.IsIdentifierText(name.Text(), core.LanguageVariantStandard) ||
		frame.type_.flags&TypeFlagsObject == 0 || b.ch.isArrayOrTupleType(frame.type_) ||
		frame.type_.symbol != nil && frame.type_.symbol.Flags&ast.SymbolFlagsClass != 0 ||
		getDeclarationModifierFlagsFromSymbol(property)&ast.ModifierFlagsNonPublicAccessibilityModifier != 0 {
		return nil
	}
	return &recursiveTypePath{parent: frame.path, name: name.Text()}
}

// Only paths through required properties actually serialized into the declaration
// can close a cycle. Searching the checker type would also find properties omitted
// by structural serialization, such as a class constructor's prototype.
func (b *NodeBuilderImpl) tryCreateRecursiveDeclarationReference(target *Type) *ast.Node {
	frame := b.ctx.recursiveTypeFrames[b.recursiveTypeIdentity(target)]
	declaration := b.ctx.recursiveTypeRootDeclaration
	// A type literal supplies a lazy object boundary. A type query directly in
	// an array or union's own annotation can instead produce TS2502 on recheck.
	if frame == nil || frame.path == nil || declaration == nil || target.flags&TypeFlagsObject == 0 ||
		b.ch.isArrayOrTupleType(target) || target.symbol != nil && target.symbol.Flags&ast.SymbolFlagsClass != 0 ||
		len(b.ch.getPropertiesOfType(target)) == 0 {
		return nil
	}
	symbol := b.ch.getSymbolOfDeclaration(declaration)
	if !b.ch.IsValueSymbolAccessible(symbol, b.ctx.enclosingFile.AsNode()) {
		return nil
	}
	resolved := b.ch.resolveName(b.ctx.enclosingDeclaration, declaration.Name().Text(), ast.SymbolFlagsValue, nil, false, false)
	if resolved == nil || b.ch.getExportSymbolOfValueSymbolIfExported(resolved) != b.ch.getExportSymbolOfValueSymbolIfExported(symbol) {
		return nil // A parameter in the current signature may shadow the root variable.
	}
	var names []string
	for path := frame.path; path != nil; path = path.parent {
		names = append(names, path.name)
		b.ctx.approximateLength += len(path.name) + 1
	}
	b.ctx.approximateLength += 6 // "typeof " minus the root's separator counted above
	name := b.newIdentifier(names[len(names)-1], symbol)
	for i := len(names) - 2; i >= 0; i-- {
		name = b.f.NewQualifiedName(name, b.f.NewIdentifier(names[i]))
	}
	return b.f.NewTypeQueryNode(name, nil)
}

// Hoisting a completed body must not capture names from the original function or
// signature scope. Binders declared inside the body itself remain valid.
func (b *NodeBuilderImpl) recursiveTypeBodyIsClosed(frame *recursiveTypeFrame) bool {
	if frame.body == nil || b.ctx.enclosingFile == nil {
		return false
	}
	scope := b.ctx.enclosingFile.AsNode()
	var check func(*ast.Node, map[string]ast.SymbolFlags) bool
	checkReference := func(name *ast.Node, meaning ast.SymbolFlags, bound map[string]ast.SymbolFlags) bool {
		for ast.IsQualifiedName(name) || ast.IsPropertyAccessExpression(name) {
			if ast.IsQualifiedName(name) {
				name = name.AsQualifiedName().Left
			} else {
				name = name.Expression()
			}
		}
		if !ast.IsIdentifier(name) {
			return false
		}
		if bound[name.Text()]&meaning != 0 {
			return true
		}
		if info := b.e.GetAutoGenerateInfo(name); info != nil {
			for _, helper := range b.ctx.recursiveTypeHelpers {
				if b.e.GetAutoGenerateInfo(helper.name).Id == info.Id {
					return true
				}
			}
			return false
		}
		symbol := b.idToSymbol[name]
		if symbol == nil {
			original := b.e.MostOriginal(name)
			location := frame.enclosingDeclaration
			if ast.IsParseTreeNode(original) && original.Parent != nil {
				location = original
			}
			symbol = b.ch.resolveName(location, name.Text(), meaning, nil, false, false)
		}
		available := b.ch.resolveName(scope, name.Text(), meaning, nil, false, false)
		return symbol != nil && available != nil && b.ch.getMergedSymbol(symbol) == b.ch.getMergedSymbol(available)
	}
	check = func(node *ast.Node, bound map[string]ast.SymbolFlags) bool {
		if node == nil {
			return true
		}
		if function := node.FunctionLikeData(); function != nil {
			bound = maps.Clone(bound)
			if function.TypeParameters != nil {
				for _, parameter := range function.TypeParameters.Nodes {
					bound[parameter.Name().Text()] |= ast.SymbolFlagsType
				}
			}
			if function.Parameters != nil {
				for _, parameter := range function.Parameters.Nodes {
					if ast.IsIdentifier(parameter.Name()) {
						bound[parameter.Name().Text()] |= ast.SymbolFlagsValue
					}
				}
			}
		}
		if ast.IsMappedTypeNode(node) {
			bound = maps.Clone(bound)
			bound[node.AsMappedTypeNode().TypeParameter.Name().Text()] |= ast.SymbolFlagsType
		}
		if ast.IsConditionalTypeNode(node) {
			conditional := node.AsConditionalTypeNode()
			inferred := maps.Clone(bound)
			var collectInfer func(*ast.Node) bool
			collectInfer = func(child *ast.Node) bool {
				if ast.IsConditionalTypeNode(child) {
					return false // Nested conditionals bind their own infer parameters.
				}
				if ast.IsInferTypeNode(child) {
					inferred[child.AsInferTypeNode().TypeParameter.Name().Text()] |= ast.SymbolFlagsType
				}
				child.ForEachChild(collectInfer)
				return false
			}
			collectInfer(conditional.ExtendsType)
			return check(conditional.CheckType, bound) && check(conditional.ExtendsType, inferred) &&
				check(conditional.TrueType, inferred) && check(conditional.FalseType, bound)
		}
		switch node.Kind {
		case ast.KindTypeReference:
			if !checkReference(node.AsTypeReferenceNode().TypeName, ast.SymbolFlagsType, bound) {
				return false
			}
		case ast.KindTypeQuery:
			if !checkReference(node.AsTypeQueryNode().ExprName, ast.SymbolFlagsValue, bound) {
				return false
			}
		case ast.KindThisType:
			return false
		case ast.KindComputedPropertyName:
			expression := node.Expression()
			if ast.IsPropertyAccessEntityNameExpression(expression, false) && !checkReference(expression, ast.SymbolFlagsValue, bound) {
				return false
			}
		}
		return !node.ForEachChild(func(child *ast.Node) bool { return !check(child, bound) })
	}
	return check(frame.body, make(map[string]ast.SymbolFlags))
}

func (b *NodeBuilderImpl) trackRecursiveTypeDeclarations() {
	if b.ctx.recursiveTypeTracker == nil || len(b.ctx.recursiveTypeHelpers) == 0 {
		return
	}
	declarations := make([]*ast.Node, 0, len(b.ctx.recursiveTypeHelpers))
	for _, frame := range b.ctx.recursiveTypeHelpers {
		declarations = append(declarations, b.f.NewTypeAliasDeclaration(nil, b.f.DeepCloneNode(frame.name), nil, frame.body))
	}
	b.ctx.recursiveTypeTracker.TrackRecursiveTypeDeclarations(declarations)
}
