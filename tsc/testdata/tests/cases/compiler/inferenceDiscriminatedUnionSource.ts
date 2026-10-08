// @strict: true
// @noEmit: true

// Inference from a union source to an object target skips constituents whose discriminant
// properties can't match the target's, regardless of the order of the union constituents.

type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; value: E };
declare function ok<const T>(value: T): Ok<T>;
declare function okInline<const T>(value: T): { ok: true; value: T };

// The mismatched constituent comes first in these unions.
type ErrShape = { ok: false; value: string };
type OkShape = { ok: true; value: string[] };

export function aliasTarget(): ErrShape | OkShape { return ok([]); }
export function inlineTarget(): ErrShape | OkShape { return okInline([]); }
export function inlineTargetReversed(): OkShape | ErrShape { return okInline([]); }

// Contravariant position: a handler accepting a wider union is assignable, and T is inferred
// from the constituent that matches the tag.
declare function on<T>(handler: (e: { kind: "a"; value: T }) => void): T;
const r1 = on((e: { kind: "a"; value: string } | { kind: "b"; value: number }) => {});
const r2 = on((e: { kind: "b"; value: number } | { kind: "a"; value: string }) => {});

// Argument position: only the matching constituent contributes to T.
declare function pick<T>(x: { kind: "a"; value: T }): T;
declare const u1: { kind: "b"; value: number } | { kind: "a"; value: string };
const r3 = pick(u1);

// A constituent with a non-literal tag type may still match.
declare const u2: { kind: string; value: number } | { kind: "a"; value: string };
const r4 = pick(u2);

// A constituent without the tag is retained.
declare const u3: { value: number } | { kind: "a"; value: string };
const r5 = pick(u3);

// A discriminant that no constituent matches is ignored.
declare function two<T>(x: { kind: "a"; sub: 1; value: T }): T;
declare const u4: { kind: "a"; sub: 2; value: string } | { kind: "b"; sub: 1; value: number };
const r6 = two(u4);

// Enum and boolean tags.
enum K { A, B }
declare function enumTag<T>(x: { kind: K.A; value: T }): T;
declare const u5: { kind: K.B; value: number } | { kind: K.A; value: string };
const r7 = enumTag(u5);
declare function boolTag<T>(x: { ok: boolean; value: T }): T;
declare const u6: Err<number> | Ok<string>;
const r8 = boolTag(u6);

// A union source in a nested position.
declare function wrap<const T>(value: T): { result: Ok<T> };
export function nested(): { result: ErrShape | OkShape } { return wrap([]); }
