package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestQuickInfoDistributedTypeParameter(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `type Conditional<T> =
    T/*check*/ extends T/*extends*/
        ? T/*trueType*/
        : T/*falseType*/;

type NonDistributed<T> = [T/*nonDistributed*/] extends [unknown] ? T : never;

type Substituted<T> =
    T/*substitutedCheck*/ extends string
        ? T/*substitutedTrueType*/
        : T/*substitutedFalseType*/;

type NestedSubstituted<T, K> =
    T extends string
        ? K extends number
            ? [T/*nestedOuter*/, K/*nestedInner*/]
            : never
        : never;

type NonDistributedSubstituted<T> = [T] extends [string] ? T/*nonDistributedSubstituted*/ : never;`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "check", "(type parameter) (distributed) T in type Conditional<T>", "")
	f.VerifyQuickInfoAt(t, "extends", "(type parameter) (distributed) T in type Conditional<T>", "")
	f.VerifyQuickInfoAt(t, "trueType", "(type parameter) (distributed) T in type Conditional<T>", "")
	f.VerifyQuickInfoAt(t, "falseType", "(type parameter) (distributed) T in type Conditional<T>", "")
	f.VerifyQuickInfoAt(t, "nonDistributed", "(type parameter) T in type NonDistributed<T>", "")
	f.VerifyQuickInfoAt(t, "substitutedCheck", "(type parameter) (distributed) T in type Substituted<T>", "")
	f.VerifyQuickInfoAt(t, "substitutedTrueType", "(type parameter) (distributed) T in type Substituted<T>", "")
	f.VerifyQuickInfoAt(t, "substitutedFalseType", "(type parameter) (distributed) T in type Substituted<T>", "")
	f.VerifyQuickInfoAt(t, "nestedOuter", "(type parameter) (distributed) T in type NestedSubstituted<T, K>", "")
	f.VerifyQuickInfoAt(t, "nestedInner", "(type parameter) (distributed) K in type NestedSubstituted<T, K>", "")
	f.VerifyQuickInfoAt(t, "nonDistributedSubstituted", "(type parameter) T in type NonDistributedSubstituted<T>", "")
}
