package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestContextualTypingGenericFunction1(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `var obj: { f<T>(x: T): T } = { f: <S>(/*1*/x) => x };
var obj2: <T>(x: T) => T = <S>(/*2*/x) => x;

class C<T> {
    obj: <T>(x: T) => T
}
var c = new C();
c.obj = <S>(/*3*/x) => x;

var matching: <T extends { id: string }, U extends T = T>(x: U) => U =
    <A extends { id: string }, B extends A = A>(/*4*/x) => x;
var differentConstraint: <T extends string>(x: T) => void =
    <S extends string | number>(/*5*/x) => {};
var differentDefault: <T = string>(x: T) => void =
    <S = number>(/*6*/x) => {};
var missingDefault: <T = string>(x: T) => void =
    <S>(/*7*/x) => {};
var differentArity: <T, U>(x: T) => void =
    <S>(/*8*/x) => {};`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "1", "(parameter) x: S", "")
	f.VerifyQuickInfoAt(t, "2", "(parameter) x: S", "")
	f.VerifyQuickInfoAt(t, "3", "(parameter) x: S", "")
	f.VerifyQuickInfoAt(t, "4", "(parameter) x: B", "")
	f.VerifyQuickInfoAt(t, "5", "(parameter) x: any", "")
	f.VerifyQuickInfoAt(t, "6", "(parameter) x: any", "")
	f.VerifyQuickInfoAt(t, "7", "(parameter) x: any", "")
	f.VerifyQuickInfoAt(t, "8", "(parameter) x: any", "")
}
