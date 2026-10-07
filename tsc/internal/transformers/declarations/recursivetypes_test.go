package declarations

import (
	"fmt"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/testutil/parsetestutil"
	"gotest.tools/v3/assert"
)

func TestRecursiveHelperNamesAfterDiscardedSerialization(t *testing.T) {
	t.Parallel()
	for _, test := range []struct {
		name      string
		source    string
		generated bool
		first     string
		second    string
		prefix    string
	}{
		{name: "discarded", first: "first_1", second: "first_2"},
		{name: "source type and value", source: "export interface first_1 {} export const first_2 = 0;", first: "first_3", second: "first_4"},
		{name: "generated name", generated: true, first: "first_1_1", second: "first_2", prefix: "export declare const first_1: number;\n"},
	} {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			ec := printer.NewEmitContext()
			f := ec.Factory
			file := parsetestutil.ParseTypeScript("export const first = 0, second = 0;"+test.source, false)
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
			variable := func(name *ast.Node, typ *ast.Node) *ast.Node {
				return f.NewVariableStatement(
					f.NewModifierList([]*ast.Node{f.NewModifier(ast.KindExportKeyword), f.NewModifier(ast.KindDeclareKeyword)}),
					f.NewVariableDeclarationList(f.NewNodeList([]*ast.Node{f.NewVariableDeclaration(name, nil, typ, nil)}), ast.NodeFlagsConst),
				)
			}
			statements := f.NewNodeList([]*ast.Node{
				variable(f.NewIdentifier("first"), f.NewUnionTypeNode(f.NewNodeList([]*ast.Node{reference(left), reference(right)}))),
				variable(f.NewIdentifier("second"), reference(next)),
			})
			if test.generated {
				generated := f.NewUniqueNameEx("first_1", printer.AutoGenerateOptions{Flags: printer.GeneratedIdentifierFlagsOptimistic})
				statements = f.NewNodeList(append([]*ast.Node{variable(generated, f.NewKeywordTypeNode(ast.KindNumberKeyword))}, statements.Nodes...))
			}
			result := tx.addRecursiveTypeDeclarations(scope, statements)
			output := f.UpdateSourceFile(file, result, file.EndOfFileToken).AsSourceFile()
			p := printer.NewPrinter(printer.PrinterOptions{NewLine: core.NewLineKindLF}, printer.PrintHandlers{}, ec)
			want := test.prefix + fmt.Sprintf("type %s = %s[];\ntype %s = %s[];\nexport declare const first: %s | %s;\ntype second_1 = second_1[];\nexport declare const second: second_1;\n", test.first, test.first, test.second, test.second, test.first, test.second)
			assert.Equal(t, p.EmitSourceFile(output), want)
		})
	}
}
