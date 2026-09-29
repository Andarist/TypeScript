// @strict: true
// @noEmit: true

type S = { kind: "a" | "b"; value: number };
type A = { kind: "a"; value: number };
type B = { kind: "b"; value: number };

type Nested = Exclude<Exclude<S, B>, A>;
type Merged = Exclude<S, A | B>;

type IsNever<T> = [T] extends [never] ? true : false;

const nestedIsNever: IsNever<Nested> = true;
const mergedIsNever: IsNever<Merged> = true;
const partialIsNotNever: IsNever<Exclude<S, B>> = false;

declare const s: S;
const nested: Nested = s; // error
const merged: Merged = s; // error
