package declarations

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/testutil/parsetestutil"
	"gotest.tools/v3/assert"
)

func TestRecursiveHelperNamesAfterDiscardedSerialization(t *testing.T) {
	t.Parallel()
	ec := printer.NewEmitContext()
	f := ec.Factory
	file := parsetestutil.ParseTypeScript("export const first = 0, second = 0;", false)
	scope := file.AsNode()
	tx := &DeclarationTransformer{state: &SymbolTrackerSharedState{currentSourceFile: file}}
	tx.NewTransformer(nil, ec)

	helper := func() *ast.Node {
		name := f.NewUniqueName("placeholder")
		ref := f.NewTypeReferenceNode(f.DeepCloneNode(name), nil)
		return f.NewTypeAliasDeclaration(nil, name, nil, f.NewArrayTypeNode(ref))
	}
	discarded, left, right, next := helper(), helper(), helper(), helper()
	tx.state.recursiveTypeDeclarations = map[*ast.Node][]*ast.Node{scope: {discarded, left, right, next}}
	reference := func(helper *ast.Node) *ast.Node {
		return f.NewTypeReferenceNode(f.DeepCloneNode(helper.Name()), nil)
	}
	variable := func(name string, typ *ast.Node) *ast.Node {
		return f.NewVariableStatement(
			f.NewModifierList([]*ast.Node{f.NewModifier(ast.KindExportKeyword), f.NewModifier(ast.KindDeclareKeyword)}),
			f.NewVariableDeclarationList(f.NewNodeList([]*ast.Node{f.NewVariableDeclaration(f.NewIdentifier(name), nil, typ, nil)}), ast.NodeFlagsConst),
		)
	}
	// Simulate accepted output after an earlier serialization attempt allocated
	// a helper but was discarded. Only the two used helpers consume first's counter.
	statements := f.NewNodeList([]*ast.Node{
		variable("first", f.NewUnionTypeNode(f.NewNodeList([]*ast.Node{reference(left), reference(right)}))),
		variable("second", reference(next)),
	})
	result := tx.addRecursiveTypeDeclarations(scope, statements)
	output := f.UpdateSourceFile(file, result, file.EndOfFileToken).AsSourceFile()
	p := printer.NewPrinter(printer.PrinterOptions{NewLine: core.NewLineKindLF}, printer.PrintHandlers{}, ec)
	assert.Equal(t, p.EmitSourceFile(output), "type first_1 = first_1[];\ntype first_2 = first_2[];\nexport declare const first: first_1 | first_2;\ntype second_1 = second_1[];\nexport declare const second: second_1;\n")
}
