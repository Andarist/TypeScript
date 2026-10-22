package checker_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/checker"
	"github.com/microsoft/TypeScript/tsc/internal/compiler"
	"gotest.tools/v3/assert"
)

func contextualWideningProgram(width int, mixed bool) *compiler.Program {
	var source strings.Builder
	source.WriteString("declare const condition: boolean;\n")
	for i := range 128 {
		if mixed {
			for j := 1; j < width; j += 2 {
				fmt.Fprintf(&source, "declare const symbol%d_%d: unique symbol;\n", i, j)
			}
			fmt.Fprintf(&source, "const result%d = { value: ", i)
			for j := range width {
				if j != 0 {
					source.WriteString(" : ")
				}
				if j != width-1 {
					source.WriteString("condition ? ")
				}
				if j%2 == 0 {
					fmt.Fprint(&source, i*width+j)
				} else {
					fmt.Fprintf(&source, "symbol%d_%d", i, j)
				}
			}
			source.WriteString(" };\n")
		} else {
			fmt.Fprintf(&source, "declare const input%d: ", i)
			for j := range width {
				if j != 0 {
					source.WriteString(" | ")
				}
				fmt.Fprintf(&source, "{ tag: %d }", i*width+j)
			}
			fmt.Fprintf(&source, ";\nconst result%d = { value: input%d };\n", i, i)
		}
	}
	return temporaryUnionProgram(source.String())
}

func TestContextualWidening(t *testing.T) {
	for _, width := range []int{2, 8, 32} {
		t.Run(fmt.Sprint(width), func(t *testing.T) {
			program := contextualWideningProgram(width, true)
			c, _ := checker.NewChecker(program, nil)
			file := program.GetSourceFile("/input.ts")
			assert.Equal(t, len(c.GetDiagnostics(t.Context(), file)), 0)
			assert.Equal(t, len(c.GetGlobalDiagnostics()), 0)
			for i := range 128 {
				statement := file.Statements.Nodes[1+(width/2+1)*i+width/2]
				declaration := statement.AsVariableStatement().DeclarationList.AsVariableDeclarationList().Declarations.Nodes[0]
				typ := c.GetTypeAtLocation(declaration.Name())
				assert.Equal(t, c.TypeToString(c.GetTypeOfPropertyOfType(typ, "value")), "number | symbol")
			}
			unions := 0
			for range c.UnionTypes() {
				unions++
			}
			t.Logf("interned unions: %d", unions)
		})
	}
}

func TestContextualWideningPreservesTypes(t *testing.T) {
	program := temporaryUnionProgram(`
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
declare const condition: boolean;
declare const token: unique symbol;
const mixed = { value: condition ? "text" : token };
type Mixed = Expect<Equal<typeof mixed.value, string | symbol>>;
const preserved: { value: "text" | typeof token } = { value: condition ? "text" : token };
const frozen = { value: condition ? "text" : token } as const;
type Frozen = Expect<Equal<typeof frozen.value, "text" | typeof token>>;
enum E { A, B }
const enumMixed = { value: condition ? E.A : token };
type EnumMixed = Expect<Equal<typeof enumMixed.value, E | symbol>>;
type Named = "stable" | typeof token;
declare const named: Named;
const namedResult = { value: named };
type NamedResult = Expect<Equal<typeof namedResult.value, "stable" | symbol>>;
type Nested = Named | 7;
declare const nested: Nested;
const nestedResult = { value: nested };
type NestedResult = Expect<Equal<typeof nestedResult.value, "stable" | 7 | symbol>>;
const nullable = { value: condition ? null : token };
type Nullable = Expect<Equal<typeof nullable.value, null | symbol>>;
declare const pattern: ` + "`prefix${string}`" + `;
const template = { value: condition ? pattern : token };
type Template = Expect<Equal<typeof template.value, ` + "`prefix${string}`" + ` | symbol>>;
`)
	c, _ := checker.NewChecker(program, nil)
	diagnostics := c.GetDiagnostics(t.Context(), program.GetSourceFile("/input.ts"))
	for _, diagnostic := range diagnostics {
		t.Log(diagnostic.String())
	}
	assert.Equal(t, len(diagnostics), 0)
	assert.Equal(t, len(c.GetGlobalDiagnostics()), 0)
}

func BenchmarkContextualWidening(b *testing.B) {
	for _, mixed := range []bool{true, false} {
		name := "mixed"
		if !mixed {
			name = "unchanged"
		}
		for _, width := range []int{2, 8, 32} {
			b.Run(fmt.Sprintf("%s/%d", name, width), func(b *testing.B) {
				program := contextualWideningProgram(width, mixed)
				file := program.GetSourceFile("/input.ts")
				ctx := b.Context()
				b.ReportAllocs()
				for b.Loop() {
					c, _ := checker.NewChecker(program, nil)
					assert.Equal(b, len(c.GetDiagnostics(ctx, file)), 0)
					assert.Equal(b, len(c.GetGlobalDiagnostics()), 0)
				}
			})
		}
	}
}
