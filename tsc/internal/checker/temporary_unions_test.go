package checker_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/bundled"
	"github.com/microsoft/TypeScript/tsc/internal/checker"
	"github.com/microsoft/TypeScript/tsc/internal/compiler"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/tsoptions"
	"github.com/microsoft/TypeScript/tsc/internal/tspath"
	"github.com/microsoft/TypeScript/tsc/internal/vfs/vfstest"
	"gotest.tools/v3/assert"
)

func residualUnionProgram(tb testing.TB, width int, multipleTargets bool) *compiler.Program {
	tb.Helper()
	var source strings.Builder
	source.WriteString(`declare function infer<T>(value: string | { value: T }): T;
declare function inferReference<T>(value: string | Box<T>): T;
interface Box<T> { value: T }
`)
	for i := range 128 {
		if multipleTargets {
			fmt.Fprintf(&source, "declare function infer%d<T>(value: string | { value: T } | { other: T }): T;\n", i)
		}
		fmt.Fprintf(&source, "declare const input%d: string", i)
		for j := range width {
			fmt.Fprintf(&source, " | { value: %d; tag: %d }", j, i*width+j)
		}
		inferName := "infer"
		if multipleTargets {
			inferName = fmt.Sprintf("infer%d", i)
		}
		fmt.Fprintf(&source, ";\nconst result%d = %s(input%d);\nconst reference%d = inferReference(input%d);\n", i, inferName, i, i, i)
		source.WriteString("const expected")
		fmt.Fprintf(&source, "%d: ", i)
		for j := range width {
			if j != 0 {
				source.WriteString(" | ")
			}
			fmt.Fprint(&source, j)
		}
		fmt.Fprintf(&source, " = result%d;\nconst same%d: typeof result%d = reference%d;\n", i, i, i, i)
	}
	return temporaryUnionProgram(source.String())
}

func temporaryUnionProgram(source string) *compiler.Program {
	fs := bundled.WrapFS(vfstest.FromMap(map[string]string{"/input.ts": source}, tspath.CaseSensitive))
	opts := &core.CompilerOptions{Strict: core.TSTrue, SkipLibCheck: core.TSTrue}
	program := compiler.NewProgram(compiler.ProgramOptions{
		Config: tsoptions.NewParsedCommandLine(opts, []tspath.RootedFilePath{"/input.ts"}, nil, "/", fs.CaseSensitivity()),
		Host:   compiler.NewCompilerHost(fs, bundled.LibPath(), nil, nil, nil),
	})
	program.BindSourceFiles()
	return program
}

func TestResidualUnionInference(t *testing.T) {
	testResidualUnionInference(t, false)
}

func TestResidualTargetUnionInference(t *testing.T) {
	testResidualUnionInference(t, true)
}

func testResidualUnionInference(t *testing.T, multipleTargets bool) {
	for _, width := range []int{2, 8, 32} {
		t.Run(fmt.Sprint(width), func(t *testing.T) {
			program := residualUnionProgram(t, width, multipleTargets)
			c, _ := checker.NewChecker(program, nil)
			assert.Equal(t, len(c.GetDiagnostics(t.Context(), program.GetSourceFile("/input.ts"))), 0)
			assert.Equal(t, len(c.GetGlobalDiagnostics()), 0)
			var expected strings.Builder
			for j := range width {
				if j != 0 {
					expected.WriteString(" | ")
				}
				fmt.Fprint(&expected, j)
			}
			file := program.GetSourceFile("/input.ts")
			stride, offset := 5, 4
			if multipleTargets {
				stride, offset = 6, 5
			}
			for i := range 128 {
				for j := range 2 {
					declaration := file.Statements.Nodes[stride*i+offset+j].AsVariableStatement().DeclarationList.AsVariableDeclarationList().Declarations.Nodes[0]
					assert.Equal(t, c.TypeToString(c.GetTypeAtLocation(declaration.Name())), expected.String())
				}
			}
			unions := 0
			for range c.UnionTypes() {
				unions++
			}
			t.Logf("interned unions: %d", unions)
		})
	}
}

func BenchmarkResidualUnionInference(b *testing.B) {
	benchmarkResidualUnionInference(b, false)
}

func BenchmarkResidualTargetUnionInference(b *testing.B) {
	benchmarkResidualUnionInference(b, true)
}

func TestResidualUnionInferenceGrouping(t *testing.T) {
	program := temporaryUnionProgram(`
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type A = { a: 1 };
type B = { b: 2 };
declare const input: string | A | B;
declare function infer<T>(value: string | T | { extra: T }): T;
const result = infer(input);
type Result = Expect<Equal<typeof result, A | B>>;
declare function contra<T>(value: string | { consume: (value: T) => void }): T;
declare const functions: string | { consume: (value: A) => void } | { consume: (value: A & B) => void };
const intersection = contra(functions);
type Intersection = Expect<Equal<typeof intersection, A & B>>;
`)
	c, _ := checker.NewChecker(program, nil)
	diagnostics := c.GetDiagnostics(t.Context(), program.GetSourceFile("/input.ts"))
	for _, diagnostic := range diagnostics {
		t.Log(diagnostic.String())
	}
	assert.Equal(t, len(diagnostics), 0)
	assert.Equal(t, len(c.GetGlobalDiagnostics()), 0)
}

func benchmarkResidualUnionInference(b *testing.B, multipleTargets bool) {
	for _, width := range []int{2, 8, 32} {
		b.Run(fmt.Sprint(width), func(b *testing.B) {
			program := residualUnionProgram(b, width, multipleTargets)
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
