package declarations

import (
	"strconv"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/nodebuilder"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
)

// Commit only helpers reachable from the accepted declaration statements. Node
// builder attempts which were subsequently discarded must not leave aliases behind.
func (tx *DeclarationTransformer) addRecursiveTypeDeclarations(scope *ast.Node, statements *ast.StatementList) *ast.StatementList {
	declarations := tx.state.recursiveTypeDeclarations[tx.EmitContext().MostOriginal(scope)]
	if len(declarations) == 0 {
		return statements
	}
	helpers := make(map[printer.AutoGenerateId]nodebuilder.RecursiveTypeDeclaration)
	for _, declaration := range declarations {
		id := tx.EmitContext().GetAutoGenerateInfo(declaration.Declaration.Name()).Id
		helpers[id] = declaration
	}
	// Pick the first reachable helper for each identity. Abandoned attempts and
	// dependencies reachable only through duplicate bodies must not claim a name.
	canonical := make(map[nodebuilder.RecursiveTypeKey]printer.AutoGenerateId)
	redirects := make(map[printer.AutoGenerateId]printer.AutoGenerateId)
	firstUse := make(map[printer.AutoGenerateId]int)
	statementIndex := 0
	var visit func(*ast.Node) bool
	visit = func(node *ast.Node) bool {
		if ast.IsIdentifier(node) {
			if info := tx.EmitContext().GetAutoGenerateInfo(node); info != nil {
				if helper, exists := helpers[info.Id]; exists {
					id := info.Id
					if helper.Key.TypeID != 0 {
						if existing, seen := canonical[helper.Key]; seen {
							id = existing
							helper = helpers[id]
							redirects[info.Id] = id
						} else {
							canonical[helper.Key] = id
						}
					}
					if _, seen := firstUse[id]; !seen {
						firstUse[id] = statementIndex
						visit(helper.Declaration.AsTypeAliasDeclaration().Type)
					}
				}
			}
		}
		node.ForEachChild(visit)
		return false
	}
	for i, statement := range statements.Nodes {
		statementIndex = i
		visit(statement)
	}
	if len(firstUse) == 0 {
		return statements
	}
	// Insert each reachable helper immediately before its first accepted use.
	// Preserve helper encounter order within that statement, including cycles
	// between helper bodies, and leave the existing import order intact.
	before := make([][]*ast.Node, len(statements.Nodes))
	names := make(map[printer.AutoGenerateId]*ast.Node, len(firstUse))
	counters := make([]int, len(statements.Nodes))
	for _, helper := range declarations {
		declaration := helper.Declaration
		id := tx.EmitContext().GetAutoGenerateInfo(declaration.Name()).Id
		if i, reachable := firstUse[id]; reachable {
			base := declaration.Name().Text()
			statement := statements.Nodes[i]
			name := statement.Name()
			if ast.IsVariableStatement(statement) {
				variables := statement.AsVariableStatement().DeclarationList.AsVariableDeclarationList().Declarations.Nodes
				if len(variables) == 1 {
					name = variables[0].Name()
				}
			}
			if name != nil && ast.IsIdentifier(name) && tx.EmitContext().GetAutoGenerateInfo(name) == nil {
				base = name.Text()
			} else if ast.HasSyntacticModifier(statement, ast.ModifierFlagsDefault) {
				base = "_default"
			}
			// Number only accepted helpers, with a fresh counter for each related
			// declaration statement. The printer still handles generated-name conflicts.
			var text string
			for {
				counters[i]++
				text = base + "_" + strconv.Itoa(counters[i])
				if !tx.state.currentSourceFile.HasIdentifier(text) {
					break
				}
			}
			names[id] = tx.Factory().NewUniqueNameEx(text, printer.AutoGenerateOptions{Flags: printer.GeneratedIdentifierFlagsOptimistic})
			before[i] = append(before[i], declaration)
		}
	}
	for id, target := range redirects {
		names[id] = names[target]
	}
	var rename *ast.NodeVisitor
	rename = tx.EmitContext().NewNodeVisitor(func(node *ast.Node) *ast.Node {
		if ast.IsIdentifier(node) {
			if info := tx.EmitContext().GetAutoGenerateInfo(node); info != nil {
				if name := names[info.Id]; name != nil {
					return tx.Factory().DeepCloneNode(name)
				}
			}
		}
		return rename.VisitEachChild(node)
	})
	result := make([]*ast.Node, 0, len(statements.Nodes)+len(firstUse))
	for i, statement := range statements.Nodes {
		result = append(result, before[i]...)
		result = append(result, statement)
	}
	tx.needsScopeFixMarker = true
	// CommonJS exports can set the scope flag even when they become variable
	// declarations. Only a real export declaration or assignment hides helpers.
	tx.resultHasScopeMarker = hasScopeMarker(statements)
	return rename.VisitNodes(tx.Factory().NewNodeList(result))
}
