package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestFormatSpaceBeforeTypeArgumentStartingWithLessThan(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `// @Filename: /a.ts
type X = ReturnType  <<T>(x: T) => number>;
f  < <T>(x: T) => T>(g);
`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.FormatDocument(t, "")
	f.VerifyCurrentFileContent(t, "type X = ReturnType<<T>(x: T) => number>;\nf<<T>(x: T) => T>(g);\n")
}
