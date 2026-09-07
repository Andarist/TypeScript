package checker_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/bundled"
	"github.com/microsoft/TypeScript/tsc/internal/checker"
	"github.com/microsoft/TypeScript/tsc/internal/compiler"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/diagnostics"
	"github.com/microsoft/TypeScript/tsc/internal/tsoptions"
	"github.com/microsoft/TypeScript/tsc/internal/vfs/vfstest"
	"gotest.tools/v3/assert"
)

// Name resolution survives a rolled-back overload attempt, so the suggestion it
// reported (JS files without checkJs report unresolved names as suggestions) must
// survive with it.
func TestSpeculationKeepsNameSuggestionAcrossRollback(t *testing.T) {
	t.Parallel()
	fs := bundled.WrapFS(vfstest.FromMap(map[string]string{
		"/globals.d.ts":  "declare function choose<T>(value: T, tag: 0): T;\ndeclare function choose<T>(value: T, tag: 1): T;\n",
		"/input.js":      "const existingName = 1;\nchoose(existinName, 1);\n",
		"/tsconfig.json": `{"compilerOptions":{"allowJs":true,"noEmit":true,"lib":["es5"]},"files":["input.js","globals.d.ts"]}`,
	}, true))
	host := compiler.NewCompilerHost("/", fs, bundled.LibPath(), nil, nil, nil)
	parsed, errs := tsoptions.GetParsedCommandLineOfConfigFile("/tsconfig.json", &core.CompilerOptions{}, nil, host, nil)
	assert.Equal(t, len(errs), 0)
	program := compiler.NewProgram(compiler.ProgramOptions{Config: parsed, Host: host})
	program.BindSourceFiles()
	file := program.GetSourceFile("/input.js")
	c, _ := checker.NewChecker(program, nil)
	assert.Equal(t, len(c.GetDiagnostics(t.Context(), file)), 0)
	suggestions := c.GetSuggestionDiagnostics(t.Context(), file)
	assert.Equal(t, len(suggestions), 1, "%v", suggestions)
	assert.Equal(t, suggestions[0].Code(), diagnostics.Could_not_find_name_0_Did_you_mean_1.Code())
}
