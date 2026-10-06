package declarations

import (
	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
)

// Commit only helpers reachable from the accepted declaration statements. Node
// builder attempts which were subsequently discarded must not leave aliases behind.
func (tx *DeclarationTransformer) addRecursiveTypeDeclarations(statements *ast.StatementList) *ast.StatementList {
	if len(tx.state.recursiveTypeDeclarations) == 0 {
		return statements
	}
	helpers := make(map[printer.AutoGenerateId]*ast.Node)
	for _, declaration := range tx.state.recursiveTypeDeclarations {
		id := tx.EmitContext().GetAutoGenerateInfo(declaration.Name()).Id
		helpers[id] = declaration
	}
	reachable := make(map[printer.AutoGenerateId]bool)
	var visit func(*ast.Node) bool
	visit = func(node *ast.Node) bool {
		if ast.IsIdentifier(node) {
			if info := tx.EmitContext().GetAutoGenerateInfo(node); info != nil {
				if helper := helpers[info.Id]; helper != nil && !reachable[info.Id] {
					reachable[info.Id] = true
					visit(helper.AsTypeAliasDeclaration().Type)
				}
			}
		}
		node.ForEachChild(visit)
		return false
	}
	for _, statement := range statements.Nodes {
		visit(statement)
	}
	var result []*ast.Node
	for _, declaration := range tx.state.recursiveTypeDeclarations {
		id := tx.EmitContext().GetAutoGenerateInfo(declaration.Name()).Id
		if reachable[id] {
			result = append(result, declaration)
			tx.needsScopeFixMarker = true
		}
	}
	if len(result) == 0 {
		return statements
	}
	return tx.Factory().NewNodeList(append(result, statements.Nodes...))
}
