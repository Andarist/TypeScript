package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestCompletionsPathsMappingToUrlWithQueryNoCrash(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `// @Filename: /home/src/project/tsconfig.json
{ "compilerOptions": { "paths": { "cdn/*": ["https://example.com/*"] } } }
// @Filename: /home/src/project/a.ts
import a from "cdn/x?y/z/*1*/";`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyCompletions(t, "1", nil)
}
