// @strict: true
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// These are declaration-emit design targets, including currently unsupported cases.
// Ideal outputs below describe type structure and helper placement, not helper spelling.
// Reuse a safe existing reference when possible. Otherwise synthesize a helper only
// after encountering a cycle; acyclic instantiations must continue to emit inline.

// @filename: self.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<M, K extends keyof M> = show<{
    [P in keyof M[K]]: M[K][P] extends "ref" ? resolve<M, K> : M[K][P];
}>;
declare const mod: <M>() => { [K in keyof M]: resolve<M, K> };

// Issue #64656: close the cycle through the declaration already being emitted.
// Ideal self.d.ts (no helper needed):
// export declare const n: {
//     Node: { value: number; next: typeof n.Node };
// };
export const n = mod<{ Node: { value: number; next: "ref" } }>();

// @filename: mutual.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<M, K extends keyof M> = show<{
    [P in keyof M[K]]: M[K][P] extends keyof M ? resolve<M, M[K][P]> : M[K][P];
}>;
declare const mod: <M>() => { [K in keyof M]: resolve<M, K> };

// Both types have existing paths. Keep both recursive edges without expanding forever.
// Ideal mutual.d.ts:
// export declare const pair: {
//     Left: { leftValue: number; right: typeof pair.Right };
//     Right: { rightValue: string; left: typeof pair.Left };
// };
export const pair = mod<{
    Left: { leftValue: number; right: "Right" };
    Right: { rightValue: string; left: "Left" };
}>();

// If a helper is needed for a mutually recursive return type, promote only the
// back-edge target. The intermediate Right object can remain inline.
// Ideal declaration (in addition to pair above):
// type left_Result = {
//     leftValue: number;
//     right: { rightValue: string; left: left_Result };
// };
// export declare function left(): left_Result;
export function left() {
    return mod<{
        Left: { leftValue: number; right: "Right" };
        Right: { rightValue: string; left: "Left" };
    }>().Left;
}

// @filename: optional.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{
    [P in keyof T]: NonNullable<T[P]> extends "ref"
        ? resolve<T> | Extract<T[P], undefined>
        : T[P];
}>;
declare function maybe<T>(): { node?: resolve<T> };

// The optional entry path includes undefined; using typeof optional.node directly
// for the recursive edge would incorrectly make the node itself possibly undefined.
// A helper is an acceptable fallback to a validated, non-nullable existing reference.
// Ideal optional.d.ts:
// type optional_Node = {
//     readonly value: number;
//     next?: optional_Node;
// };
// export declare const optional: { node?: optional_Node };
export const optional = maybe<{ readonly value: number; next?: "ref" }>();

// @filename: generic.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

// A hoisted helper must capture the function's type parameter explicitly, including
// its constraint. Only the node reached by the back edge needs to become a helper.
// Ideal generic.d.ts:
// type make_Node<T extends { id: string }> = {
//     value: T;
//     next: make_Node<T>;
// };
// export declare function make<T extends { id: string }>(value: T): {
//     node: make_Node<T>;
//     label: string;
// };
export function make<T extends { id: string }>(value: T) {
    return { node: mod<{ value: T; next: "ref" }>(), label: value.id };
}

// A parameter introduced by a returned call signature is not in the enclosing
// function's scope. The helper must be generic and instantiated inside that signature.
// Ideal declaration (in addition to make above):
// type factory_Node<T> = { value: T; next: factory_Node<T> };
// export declare function factory(): <T>(value: T) => factory_Node<T>;
export function factory() {
    return <T>(value: T) => mod<{ value: T; next: "ref" }>();
}

// @filename: containers.ts
// A cycle can pass through a union and array rather than a direct object property.
// The local alias cannot be referenced from the emitted declaration's scope.
// Ideal containers.d.ts:
// type tree_Result = string | tree_Result[];
// export declare function tree(): tree_Result;
export function tree() {
    type Local = string | Local[];
    return null as unknown as Local;
}

// Preserve readonly tuple structure at the recursive edge.
// Ideal declaration (in addition to tree above):
// type tuple_Result = readonly [number, tuple_Result];
// export declare function tuple(): tuple_Result;
export function tuple() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

// @filename: instantiations.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

// The same mapped declaration produces distinct cycles and shares no output anchor.
// Cached serialization must not reuse the first declaration's recursive reference.
// Ideal instantiations.d.ts:
// export declare const numbers: { value: number; next: typeof numbers };
// export declare const strings: { value: string; next: typeof strings };
// export declare const numbersAgain: { value: number; next: typeof numbersAgain };
export const numbers = mod<{ value: number; next: "ref" }>();
export const strings = mod<{ value: string; next: "ref" }>();
export const numbersAgain = mod<{ value: number; next: "ref" }>();

// @filename: acyclic.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

// The mapper can produce recursion, but these instantiations never encounter it.
// Repeated sibling shapes and finite nesting are also not cycles.
// Ideal acyclic.d.ts (no synthesized helpers anywhere in this file):
// export declare const leaf: { value: number; next: null };
// export declare const siblings: {
//     left: { value: number; next: null };
//     right: { value: number; next: null };
// };
// export declare const finite: { value: number[][][] };
export const leaf = mod<{ value: number; next: null }>();
export const siblings = {
    left: mod<{ value: number; next: null }>(),
    right: mod<{ value: number; next: null }>(),
};
export const finite = mod<{ value: number[][][] }>();

// An existing name that already closes a cycle must keep being reused.
// Ideal declaration (in addition to the acyclic exports above):
// export interface Named { value: number; next: Named; }
// export declare const named: Named;
export interface Named {
    value: number;
    next: Named;
}
declare const source: Named;
export const named = source;
