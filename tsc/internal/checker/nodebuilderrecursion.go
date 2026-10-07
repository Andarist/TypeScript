package checker

import (
	"maps"
	"slices"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/nodebuilder"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/scanner"
)

type recursiveTypeFrame struct {
	name                 *ast.Node
	body                 *ast.Node
	enclosingDeclaration *ast.Node
	path                 *recursiveTypePath
	typ                  *Type
	key                  CompositeTypeCacheIdentity
}

// Keep path tracking cheap for acyclic types. Entity-name nodes are allocated
// only when an actual back edge needs a reference to the output declaration.
type recursiveTypePath struct {
	parent *recursiveTypePath
	name   string
}

// Called only after serialization encounters an actual back edge. A nameable
// declaration remains preferable to introducing a new recursive type alias.
func (b *NodeBuilderImpl) tryCreateRecursiveTypeReference(t *Type, frame *recursiveTypeFrame) *ast.Node {
	if frame == nil {
		return nil
	}
	if reference := b.tryCreateRecursiveDeclarationReference(t, frame); reference != nil {
		b.ctx.recursiveTypeReferenceUsed = true
		return reference
	}
	// A global script has no private source-file scope. Printer-generated names
	// are only unique within one file, so a global helper could collide with a
	// helper from another file. Namespace blocks and external modules are safe.
	scope := b.ctx.recursiveTypeScope
	if scope == nil || ast.IsSourceFile(scope) && !ast.IsExternalOrCommonJSModule(scope.AsSourceFile()) {
		return nil
	}
	if frame.name == nil {
		frame.name = b.e.Factory.NewUniqueNameEx(b.recursiveTypeHelperBaseName(t), printer.AutoGenerateOptions{Flags: printer.GeneratedIdentifierFlagsOptimistic})
		b.ctx.recursiveTypeHelpers = append(b.ctx.recursiveTypeHelpers, frame)
	}
	b.ctx.recursiveTypeReferenceUsed = true
	b.ctx.approximateLength += len(frame.name.Text())
	return b.f.NewTypeReferenceNode(b.f.DeepCloneNode(frame.name), nil)
}

func (b *NodeBuilderImpl) recursiveTypeHelperBaseName(t *Type) string {
	if root := b.ctx.recursiveTypeRootDeclaration; root != nil && ast.IsExportAssignment(root) {
		if root.AsExportAssignment().IsExportEquals && ast.IsSourceFileJS(b.ctx.enclosingFile) {
			return "_exports"
		}
		return "_default"
	}
	for enclosing := b.ctx.enclosingDeclaration; enclosing != nil && !ast.IsSourceFile(enclosing); enclosing = enclosing.Parent {
		if name := enclosing.Name(); name != nil && ast.IsIdentifier(name) {
			return name.Text()
		}
		if ast.IsExportAssignment(enclosing) || ast.HasSyntacticModifier(enclosing, ast.ModifierFlagsDefault) {
			if ast.IsExportAssignment(enclosing) && enclosing.AsExportAssignment().IsExportEquals && ast.IsSourceFileJS(b.ctx.enclosingFile) {
				return "_exports"
			}
			return "_default"
		}
	}
	// CommonJS serialization may use the source file as its enclosing scope.
	// An assigned class still supplies the property name of its original root.
	if t.symbol != nil && t.symbol.ValueDeclaration != nil {
		parent := t.symbol.ValueDeclaration.Parent
		if parent != nil && ast.IsAssignmentExpression(parent, true) && ast.IsPropertyAccessExpression(parent.AsBinaryExpression().Left) {
			return parent.AsBinaryExpression().Left.Name().Text()
		}
		if parent != nil && ast.IsExportAssignment(parent) {
			return "_default"
		}
	}
	return "_type"
}

// Extend an output path only while emitting a required, public property signature.
// Optional properties include undefined, and a class's structural constructor
// declaration need not retain the checker's synthetic prototype property.
func (b *NodeBuilderImpl) recursiveTypePathForProperty(property *ast.Symbol, name *ast.Node) *recursiveTypePath {
	frame := b.ctx.recursiveTypeCurrentFrame
	if frame == nil || frame.path == nil || property.Flags&ast.SymbolFlagsOptional != 0 ||
		!(ast.IsIdentifier(name) || ast.IsStringLiteral(name)) || !scanner.IsIdentifierText(name.Text(), core.LanguageVariantStandard) ||
		frame.typ.flags&TypeFlagsObject == 0 || b.ch.isArrayOrTupleType(frame.typ) ||
		frame.typ.symbol != nil && frame.typ.symbol.Flags&ast.SymbolFlagsClass != 0 ||
		getDeclarationModifierFlagsFromSymbol(property)&ast.ModifierFlagsNonPublicAccessibilityModifier != 0 {
		return nil
	}
	return &recursiveTypePath{parent: frame.path, name: name.Text()}
}

// Only paths through required properties actually serialized into the declaration
// can close a cycle. Searching the checker type would also find properties omitted
// by structural serialization, such as a class constructor's prototype.
func (b *NodeBuilderImpl) tryCreateRecursiveDeclarationReference(target *Type, frame *recursiveTypeFrame) *ast.Node {
	declaration := b.ctx.recursiveTypeRootDeclaration
	// A type literal supplies a lazy object boundary. A type query directly in
	// an array or union's own annotation can instead produce TS2502 on recheck.
	if frame == nil || frame.path == nil || declaration == nil || !ast.IsVariableDeclaration(declaration) || target.flags&TypeFlagsObject == 0 ||
		b.ch.isArrayOrTupleType(target) || target.symbol != nil && target.symbol.Flags&ast.SymbolFlagsClass != 0 ||
		len(b.ch.getPropertiesOfType(target)) == 0 {
		return nil
	}
	symbol := b.ch.getSymbolOfDeclaration(declaration)
	var path []*Type
	for current := frame.path; current.parent != nil; current = current.parent {
		path = append(path, b.ch.getStringLiteralType(current.name))
	}
	slices.Reverse(path)
	// Reuse the shared resolver's identity and accessibility checks. The path
	// comes from emitted members because mapped properties may have no assigned
	// value declaration from which the source-based resolver can derive a name.
	name := b.getValueTypeName(target, symbol, path)
	if name.symbol == nil || !b.isSerializationTypeNameAccessible(name) {
		return nil
	}
	return b.serializationTypeNameToNode(name)
}

// Hoisting a completed body must not capture names from the original function or
// signature scope. Binders declared inside the body itself remain valid.
func (b *NodeBuilderImpl) recursiveTypeBodyIsClosed(frame *recursiveTypeFrame) bool {
	if frame.body == nil || b.ctx.enclosingFile == nil {
		return false
	}
	scope := b.ctx.recursiveTypeScope
	var check func(*ast.Node, map[string]ast.SymbolFlags) bool
	checkReference := func(name *ast.Node, meaning ast.SymbolFlags, bound map[string]ast.SymbolFlags) bool {
		if ast.IsQualifiedName(name) && meaning == ast.SymbolFlagsType {
			// The left side of a qualified type name names a namespace, even
			// though the complete reference has type meaning.
			meaning = ast.SymbolFlagsNamespace
		}
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
	declarations := make([]nodebuilder.RecursiveTypeDeclaration, 0, len(b.ctx.recursiveTypeHelpers))
	for _, frame := range b.ctx.recursiveTypeHelpers {
		declarations = append(declarations, nodebuilder.RecursiveTypeDeclaration{
			Declaration: b.f.NewTypeAliasDeclaration(nil, b.f.DeepCloneNode(frame.name), nil, frame.body),
			Key: nodebuilder.RecursiveTypeKey{
				TypeID:              uint32(frame.key.typeId),
				Flags:               frame.key.flags,
				InternalFlags:       frame.key.internalFlags,
				InferTypeParameters: [2]uint64{frame.key.inferTypeParameters.Lo, frame.key.inferTypeParameters.Hi},
			},
		})
	}
	b.ctx.recursiveTypeTracker.TrackRecursiveTypeDeclarations(b.ctx.recursiveTypeScope, declarations)
}

// Closed helpers can be reused across sibling definitions within one declaration.
// They must never escape this node-builder context through serializedTypes.
func (b *NodeBuilderImpl) recursiveTypeReferenceKey(t *Type) CompositeTypeCacheIdentity {
	key := CompositeTypeCacheIdentity{typeId: b.serializationTypeId(t), flags: b.ctx.flags, internalFlags: b.ctx.internalFlags}
	if len(b.ctx.inferTypeParameters) != 0 {
		key.inferTypeParameters = getTypeListKey(b.ctx.inferTypeParameters)
	}
	return key
}

func (b *NodeBuilderImpl) finishRecursiveTypeDefinition(frame *recursiveTypeFrame, result *ast.Node) *ast.Node {
	if frame == nil || frame.name == nil {
		return result
	}
	frame.body = result
	if !b.ctx.encounteredError && !b.recursiveTypeBodyIsClosed(frame) {
		b.ctx.encounteredError = true
		b.ctx.tracker.ReportCyclicStructureError()
	}
	result = b.f.NewTypeReferenceNode(b.f.DeepCloneNode(frame.name), nil)
	b.ctx.recursiveTypeReferenceUsed = true
	b.ctx.approximateLength += len(frame.name.Text())
	if !b.ctx.encounteredError {
		if b.ctx.recursiveTypeReferences == nil {
			b.ctx.recursiveTypeReferences = make(map[CompositeTypeCacheIdentity]*ast.Node)
		}
		b.ctx.recursiveTypeReferences[frame.key] = result
	}
	return result
}
