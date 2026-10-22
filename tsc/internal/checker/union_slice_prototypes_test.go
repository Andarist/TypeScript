package checker_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/checker"
	"github.com/microsoft/TypeScript/tsc/internal/compiler"
	"gotest.tools/v3/assert"
)

func mappedCollisionProgram(width int, collide bool) *compiler.Program {
	var source strings.Builder
	source.WriteString(`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`)
	for i := range 16 {
		fmt.Fprintf(&source, "type Keys%d = ", i)
		for j := range width {
			if j != 0 {
				source.WriteString(" | ")
			}
			fmt.Fprintf(&source, "\"g%dk%d\"", i, j)
		}
		if collide {
			fmt.Fprintf(&source, ";\ntype Mapped%d = { [K in Keys%d as \"value\"]: { key: K } };\ntype Check%d = Expect<Equal<Mapped%d[\"value\"], { key: Keys%d }>>;\n", i, i, i, i, i)
		} else {
			fmt.Fprintf(&source, ";\ntype Mapped%d = { [K in Keys%d]: { key: K } };\ntype Check%d = Expect<Equal<Mapped%d[\"g%dk0\"], { key: \"g%dk0\" }>>;\n", i, i, i, i, i, i)
		}
	}
	return temporaryUnionProgram(source.String())
}

func objectRestSliceProgram(omissions int) *compiler.Program {
	var source strings.Builder
	for i := range 32 {
		fmt.Fprintf(&source, "declare const input%d: {", i)
		for j := range 128 {
			fmt.Fprintf(&source, "g%dk%d: %d;", i, j, j)
		}
		source.WriteString("};\nconst { ")
		for j := range omissions {
			fmt.Fprintf(&source, "g%dk%d: local%d_%d, ", i, j, i, j)
		}
		fmt.Fprintf(&source, "...rest%d } = input%d;\nconst check%d: { g%dk127: 127 } = rest%d;\n", i, i, i, i, i)
	}
	return temporaryUnionProgram(source.String())
}

func checkUnionSliceProgram(t *testing.T, program *compiler.Program) {
	t.Helper()
	c, _ := checker.NewChecker(program, nil)
	diagnostics := c.GetDiagnostics(t.Context(), program.GetSourceFile("/input.ts"))
	for _, diagnostic := range diagnostics {
		t.Log(diagnostic.String())
	}
	assert.Equal(t, len(diagnostics), 0)
	assert.Equal(t, len(c.GetGlobalDiagnostics()), 0)
	unions, constituents := 0, 0
	for union := range c.UnionTypes() {
		unions++
		constituents += len(union.Types())
	}
	t.Logf("interned unions: %d, constituents: %d", unions, constituents)
}

func TestMappedCollisionSlices(t *testing.T) {
	for _, width := range []int{8, 32, 128, 512} {
		t.Run(fmt.Sprint(width), func(t *testing.T) {
			checkUnionSliceProgram(t, mappedCollisionProgram(width, true))
		})
	}
}

func TestObjectRestSlices(t *testing.T) {
	for _, omissions := range []int{0, 2, 8, 32} {
		t.Run(fmt.Sprint(omissions), func(t *testing.T) {
			checkUnionSliceProgram(t, objectRestSliceProgram(omissions))
		})
	}
}

func TestUnionSliceFallbacks(t *testing.T) {
	checkUnionSliceProgram(t, temporaryUnionProgram(`
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
enum A { X = "same", Y = "different" }
enum B { X = "same" }
type Enums = { [K in A | B as "value"]: K };
type EnumCheck = Expect<Equal<Enums["value"], A | B>>;
type PartialMap = { [K in "a" | "b" | "c" as K extends "c" ? "other" : "value"]?: K };
type PartialCheck = Expect<Equal<PartialMap["value"], "a" | "b" | undefined>>;
type Recursive<T> = { [K in keyof T as "value"]: { key: K; next: Recursive<T> } };
declare const recursive: Recursive<{ a: 1; b: 2; c: 3 }>;
const recursiveKeys: "a" | "b" | "c" = recursive.value.next.value.key;
declare const key: unique symbol;
declare const input: { a: 1; b: 2; 3: 3; [key]: 4; keep: 5 };
const { a, b, 3: numeric, [key]: symbolic, ...rest } = input;
type RestCheck = Expect<Equal<typeof rest, { keep: 5 }>>;
const { ...all } = input;
type AllCheck = Expect<Equal<typeof all, typeof input>>;
declare const dynamicKey: "a" | "b";
const { [dynamicKey]: dynamicValue, ...dynamicRest } = input;
type DynamicRestCheck = Expect<Equal<typeof dynamicRest, { 3: 3; [key]: 4; keep: 5 }>>;
declare class Hidden {
    private hidden: 1;
    keep: 5;
    method(): void;
}
declare const hidden: Hidden;
const { ...visible } = hidden;
type VisibleCheck = Expect<Equal<typeof visible, { keep: 5 }>>;
function generic<T extends { a: 1; b: 2 }>(value: T) {
    const { a, ...rest } = value;
    const expected: Omit<T, "a"> = rest;
    return expected;
}
declare function infer<T>(value: string | T | { extra: T }): T;
declare const source: string | { a: 1 } | { b: 2 };
const inferred = infer(source);
type GroupedCheck = Expect<Equal<typeof inferred, { a: 1 } | { b: 2 }>>;
`))
}

func benchmarkUnionSliceProgram(b *testing.B, program *compiler.Program) {
	file := program.GetSourceFile("/input.ts")
	ctx := b.Context()
	b.ReportAllocs()
	for b.Loop() {
		c, _ := checker.NewChecker(program, nil)
		assert.Equal(b, len(c.GetDiagnostics(ctx, file)), 0)
		assert.Equal(b, len(c.GetGlobalDiagnostics()), 0)
	}
}

func BenchmarkMappedCollisionSlices(b *testing.B) {
	for _, width := range []int{8, 32, 128, 512} {
		b.Run(fmt.Sprint(width), func(b *testing.B) {
			benchmarkUnionSliceProgram(b, mappedCollisionProgram(width, true))
		})
	}
}

func BenchmarkMappedNoCollisionSlices(b *testing.B) {
	b.Run("128", func(b *testing.B) {
		benchmarkUnionSliceProgram(b, mappedCollisionProgram(128, false))
	})
}

func BenchmarkObjectRestSlices(b *testing.B) {
	for _, omissions := range []int{0, 2, 8, 32} {
		b.Run(fmt.Sprint(omissions), func(b *testing.B) {
			benchmarkUnionSliceProgram(b, objectRestSliceProgram(omissions))
		})
	}
}
