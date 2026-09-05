package checker_test

import (
	"fmt"
	"path/filepath"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/bundled"
	"github.com/microsoft/TypeScript/tsc/internal/checker"
	"github.com/microsoft/TypeScript/tsc/internal/compiler"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/repo"
	"github.com/microsoft/TypeScript/tsc/internal/tsoptions"
	"github.com/microsoft/TypeScript/tsc/internal/tspath"
	"github.com/microsoft/TypeScript/tsc/internal/vfs/osvfs"
	"github.com/microsoft/TypeScript/tsc/internal/vfs/vfstest"
)

// Reuse parsed/bound files but create a fresh checker each iteration, measuring
// checking rather than parsing or file IO. Run serially to avoid CPU contention.
func BenchmarkSpeculationWorkload(b *testing.B) {
	for _, tc := range []struct {
		name                   string
		overloads, tag, errors int
	}{
		{"Single", 1, 0, 0}, {"FirstOf8", 8, 0, 0}, {"LastOf8", 8, 7, 0},
		{"Errors100LastOf8", 8, 7, 100}, {"Errors1000LastOf8", 8, 7, 1000},
	} {
		b.Run(tc.name, func(b *testing.B) {
			var source strings.Builder
			for i := 0; i < tc.errors; i++ {
				fmt.Fprintf(&source, "missing%d;\n", i)
			}
			for i := 0; i < tc.overloads; i++ {
				fmt.Fprintf(&source, "declare function select<T>(value: T, fn: (x: T) => T, tag: %d): T;\n", i)
			}
			for i := 0; i < 200; i++ {
				fmt.Fprintf(&source, "const result%d = select({value: %d}, x => x, %d);\n", i, i, tc.tag)
			}
			fs := bundled.WrapFS(vfstest.FromMap(map[string]string{
				"/input.ts":      source.String(),
				"/tsconfig.json": `{"compilerOptions":{"strict":true,"skipLibCheck":true,"lib":["es5"]},"files":["input.ts"]}`,
			}, true))
			host := compiler.NewCompilerHost("/", fs, bundled.LibPath(), nil, nil, nil)
			parsed, errs := tsoptions.GetParsedCommandLineOfConfigFile("/tsconfig.json", &core.CompilerOptions{}, nil, host, nil)
			if len(errs) != 0 {
				b.Fatal(errs)
			}
			program := compiler.NewProgram(compiler.ProgramOptions{Config: parsed, Host: host})
			program.BindSourceFiles()
			file := program.GetSourceFile("/input.ts")
			b.ReportAllocs()
			for b.Loop() {
				c, _ := checker.NewChecker(program, nil)
				diags := c.GetDiagnostics(b.Context(), file)
				if len(diags) != tc.errors {
					b.Fatalf("got %d diagnostics, expected %d", len(diags), tc.errors)
				}
			}
		})
	}
}

func BenchmarkSpeculationCompilerFixture(b *testing.B) {
	root := tspath.NormalizeSlashes(filepath.Join(repo.TestDataPath(), "fixtures/compiler"))
	host := compiler.NewCompilerHost(root, bundled.WrapFS(osvfs.FS()), bundled.LibPath(), nil, nil, nil)
	parsed, errs := tsoptions.GetParsedCommandLineOfConfigFile(tspath.CombinePaths(root, "tsconfig.json"), nil, nil, host, nil)
	if len(errs) != 0 {
		b.Fatal(errs)
	}
	program := compiler.NewProgram(compiler.ProgramOptions{Config: parsed, Host: host})
	program.BindSourceFiles()
	b.ReportAllocs()
	for b.Loop() {
		c, _ := checker.NewChecker(program, nil)
		total := 0
		for _, file := range program.GetSourceFiles() {
			if !program.SkipTypeChecking(file, false) {
				total += len(c.GetDiagnostics(b.Context(), file))
			}
		}
		b.ReportMetric(float64(total), "diagnostics/op")
	}
}
