//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpers.ts] ////

//// [self.ts]
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

//// [mutual.ts]
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

//// [optional.ts]
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

// Both optional entry points reach the same instantiated recursive type. Reuse
// the helper discovered for the first entry instead of synthesizing a second one.
// Ideal declaration (in addition to optional above):
// type shared_Node = { next: shared_Node };
// export declare const shared: { left?: shared_Node; right?: shared_Node };
declare function both<T>(): { left?: resolve<T>; right?: resolve<T> };
export const shared = both<{ next: "ref" }>();

//// [containers.ts]
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

//// [signatures.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

// A generic signature inside the helper binds its own T. This does not capture T
// from the enclosing scope and must not be rejected with the scoped-types cases.
// Ideal signatures.d.ts:
// type signatures_Node = {
//     next: signatures_Node;
//     identity: <T>(value: T) => T;
//     unwrap: <T>(value: T) => T extends readonly (infer U)[] ? U : T;
//     copy: <T>(value: T) => { [K in keyof T]: T[K] };
// };
// export declare const signatures: { node?: signatures_Node };
export const signatures = maybe<{
    next: "ref";
    identity: <T>(value: T) => T;
    unwrap: <T>(value: T) => T extends readonly (infer U)[] ? U : T;
    copy: <T>(value: T) => { [K in keyof T]: T[K] };
}>();

//// [collisions.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

// A generated helper must not collide with an existing type or value name.
// Ideal collisions.d.ts:
// export interface collision_recursive { occupied: true; }
// type collision_recursive_1 = { next: collision_recursive_1 };
// export declare const collision: { node?: collision_recursive_1 };
export interface collision_recursive {
    occupied: true;
}
export const collision = maybe<{ next: "ref" }>();

//// [symbols.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

// A helper may reference a top-level symbol, including in a computed property name.
// Ideal symbols.d.ts:
// export declare const key: unique symbol;
// type keyed_Node = { next: keyed_Node; [key]: number };
// export declare const keyed: { node?: keyed_Node };
export declare const key: unique symbol;
export const keyed = maybe<{ next: "ref"; [key]: number }>();

//// [payload.ts]
export interface Payload {
    name: string;
}

//// [imported.ts]
import { Payload as Input } from "./payload";
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

// A top-level import remains available to the helper. Its late-painted import
// declaration must survive even though only the synthesized body references it.
// Ideal imported.d.ts:
// import { Payload as Input } from "./payload";
// type imported_Node = { value: Input; next: imported_Node };
// export declare const imported: { node?: imported_Node };
export const imported = maybe<{ value: Input; next: "ref" }>();

//// [recursiveArray.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
function source() {
    type Local = show<{ next: Local[] }>;
    return null as unknown as Local["next"];
}

// Array roots cannot safely close the cycle with typeof nodes in their own array
// annotation. A helper at the array's back-edge target is a safe fallback.
// Ideal recursiveArray.d.ts:
// type nodes_Result = { next: nodes_Result }[];
// export declare const nodes: nodes_Result;
export const nodes = source();

//// [shadowedAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ value: T; read: (node: string) => resolve<T> }>;
declare function mod<T>(): resolve<T>;

// The parameter named node shadows the variable at the recursive return type.
// typeof node would mean string there, so use a closed helper instead.
// Ideal shadowedAnchor.d.ts:
// type node_Result = { value: number; read: (node: string) => node_Result };
// export declare const node: node_Result;
export const node = mod<number>();

//// [classAnchor.ts]
// The checker gives a class a synthetic prototype property. A structural
// constructor declaration does not retain that property, so ctor.prototype is
// not a safe recursive anchor for the emitted instance type.
// Ideal classAnchor.d.ts:
// type ctor_Instance = { next(): ctor_Instance };
// export declare const ctor: { new (): ctor_Instance };
export const ctor = class Inner {
    next(): Inner {
        return this;
    }
};

//// [instantiations.ts]
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

//// [acyclic.ts]
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




//// [self.d.ts]
export declare const n: {
    Node: {
        value: number;
        next: typeof n.Node;
    };
};
//// [mutual.d.ts]
type left_recursive = {
    leftValue: number;
    right: {
        rightValue: string;
        left: left_recursive;
    };
};
export declare const pair: {
    Left: {
        leftValue: number;
        right: {
            rightValue: string;
            left: typeof pair.Left;
        };
    };
    Right: {
        rightValue: string;
        left: {
            leftValue: number;
            right: typeof pair.Right;
        };
    };
};
export declare function left(): left_recursive;
export {};
//// [optional.d.ts]
type optional_recursive = {
    readonly value: number;
    next?: optional_recursive | undefined;
};
type shared_recursive = {
    next: shared_recursive;
};
export declare const optional: {
    node?: optional_recursive | undefined;
};
export declare const shared: {
    left?: shared_recursive | undefined;
    right?: shared_recursive | undefined;
};
export {};
//// [containers.d.ts]
type tree_recursive = (string | tree_recursive)[];
type tuple_recursive = readonly [number, tuple_recursive];
export declare function tree(): string | tree_recursive;
export declare function tuple(): tuple_recursive;
export {};
//// [signatures.d.ts]
type signatures_recursive = {
    next: signatures_recursive;
    identity: <T>(value: T) => T;
    unwrap: <T>(value: T) => T extends readonly (infer U)[] ? U : T;
    copy: <T>(value: T) => { [K in keyof T]: T[K]; };
};
export declare const signatures: {
    node?: signatures_recursive | undefined;
};
export {};
//// [collisions.d.ts]
type collision_recursive_1 = {
    next: collision_recursive_1;
};
export interface collision_recursive {
    occupied: true;
}
export declare const collision: {
    node?: collision_recursive_1 | undefined;
};
export {};
//// [symbols.d.ts]
type keyed_recursive = {
    next: keyed_recursive;
    [key]: number;
};
export declare const key: unique symbol;
export declare const keyed: {
    node?: keyed_recursive | undefined;
};
export {};
//// [payload.d.ts]
export interface Payload {
    name: string;
}
//// [imported.d.ts]
type imported_recursive = {
    value: Input;
    next: imported_recursive;
};
import { Payload as Input } from "./payload";
export declare const imported: {
    node?: imported_recursive | undefined;
};
export {};
//// [recursiveArray.d.ts]
type nodes_recursive = {
    next: nodes_recursive[];
};
export declare const nodes: nodes_recursive[];
export {};
//// [shadowedAnchor.d.ts]
type node_recursive = {
    value: number;
    read: (node: string) => node_recursive;
};
export declare const node: node_recursive;
export {};
//// [classAnchor.d.ts]
type ctor_recursive = {
    next(): ctor_recursive;
};
export declare const ctor: {
    new (): ctor_recursive;
};
export {};
//// [instantiations.d.ts]
export declare const numbers: {
    value: number;
    next: typeof numbers;
};
export declare const strings: {
    value: string;
    next: typeof strings;
};
export declare const numbersAgain: {
    value: number;
    next: typeof numbersAgain;
};
//// [acyclic.d.ts]
export declare const leaf: {
    value: number;
    next: null;
};
export declare const siblings: {
    left: {
        value: number;
        next: null;
    };
    right: {
        value: number;
        next: null;
    };
};
export declare const finite: {
    value: number[][][];
};
export interface Named {
    value: number;
    next: Named;
}
export declare const named: Named;
