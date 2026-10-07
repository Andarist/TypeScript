package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestRecursiveFunctionQuickInfo(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `
const arrow/*arrow*/ = () => arrow;
const broad: unknown = function self/*self*/() { return self; };
arrow/*use*/()();
const object/*object*/ = { next: () => object };
const tuple/*tuple*/ = [() => tuple] as const;
arrow/*reference*/;
const alias = arrow;
alias/*aliasUse*/();
`
	f, done := fourslash.NewFourslash(t, nil, content)
	defer done()
	f.VerifyQuickInfoAt(t, "arrow", "const arrow: () => typeof arrow", "")
	f.VerifyQuickInfoAt(t, "use", "const arrow: () => () => typeof arrow", "")
	f.VerifyQuickInfoAt(t, "self", "function self(): () => typeof broad", "")
	f.VerifyQuickInfoAt(t, "object", "const object: {\n    next: () => ...;\n}", "")
	f.VerifyQuickInfoAt(t, "tuple", "const tuple: readonly [() => ...]", "")
	f.VerifyQuickInfoAt(t, "reference", "const arrow: () => typeof arrow", "")
	f.VerifyQuickInfoAt(t, "aliasUse", "const alias: () => () => typeof arrow", "")
	f.VerifyNoErrors(t)
}

func TestRecursiveFunctionCallQuickInfo(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `// @strict: true
const arrow/*declaration*/ = () => arrow;
arrow/*call*/();
const named = function self() { return self; };
named/*namedCall*/();
function recur() { return recur; }
recur/*functionCall*/();
const generic = <T>(value: T) => generic;
generic/*genericCall*/(1);
const specialized = generic<string>;
specialized/*specializedCall*/("text");
declare let narrowed: typeof arrow | undefined;
if (narrowed) narrowed/*narrowedCall*/();
declare const broad: () => unknown;
broad/*broadCall*/();
function overloaded(value: string): string;
function overloaded(value: number): typeof overloaded;
function overloaded(value: string | number): string | typeof overloaded {
    return typeof value === "string" ? value : overloaded;
}
overloaded/*stringCall*/("text");
overloaded/*numberCall*/(1);
const object = { recur() { return object.recur; } };
object.recur/*methodCall*/();
const first/*firstDeclaration*/ = () => second;
const second = () => first;
first/*firstCall*/();
function genericFunction<T>(value: T) { return genericFunction; }
genericFunction/*genericFunctionCall*/(1);
const callable = () => callable;
callable.property = 1;
callable/*callableCall*/();
const other = () => 1;
const producer/*producerDeclaration*/ = () => other;
producer/*producerCall*/();`
	f, done := fourslash.NewFourslash(t, nil, content)
	defer done()
	f.VerifyNoErrors(t)
	f.VerifyBaselineHoverWithVerbosity(t, map[string][]int{
		"declaration": {0, 1, 2}, "call": {0, 1, 2}, "namedCall": {0, 1, 2},
		"functionCall": {0, 1, 2}, "genericCall": {0}, "specializedCall": {0},
		"narrowedCall": {0, 1, 2}, "broadCall": {0, 1, 2},
		"stringCall": {0, 1, 2}, "numberCall": {0}, "methodCall": {0, 1, 2},
		"firstDeclaration": {0, 1, 2}, "firstCall": {0, 1, 2},
		"genericFunctionCall": {0}, "callableCall": {0, 1, 2},
		"producerDeclaration": {0, 1, 2}, "producerCall": {0, 1, 2},
	})
}
