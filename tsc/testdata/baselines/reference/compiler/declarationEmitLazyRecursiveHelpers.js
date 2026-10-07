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

//// [quotedAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): { "node": resolve<T> };

// A quoted property whose text is a valid identifier still supplies an exact path.
// Ideal quotedAnchor.d.ts (no helper needed):
// export declare const quoted: { "node": { next: typeof quoted.node } };
export const quoted = mod<{ next: "ref" }>();

//// [wideAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
type Bit = "0" | "1";
type Keys = `${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}`;
declare function mod<T>(): { [K in Keys | "node"]: K extends "node" ? resolve<T> : { key: K } };

// Unrelated sibling properties must not consume a search budget and force a helper.
// Ideal wideAnchor.d.ts (no helper needed):
// export declare const wide: {
//     "0000000": { key: "0000000" }; // ... all other Keys properties ...
//     node: { next: typeof wide.node };
// };
export const wide = mod<{ next: "ref" }>();

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

//// [cacheSiblings.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function batch<T>(): {
    first?: resolve<T>;
    second: { node: resolve<T>; leaf: { value: string; nested: { id: number } } };
    leaf: { value: string; nested: { id: number } };
};

// Reuse the helper inside a later subtree, while keeping unrelated leaves inline.
// Neither subtree may retain a helper or variable anchor from a previous context.
// Ideal declaration (apart from the second variable's separate helper):
// type mixed_Node = { value: number; next: mixed_Node };
// export declare const mixed: {
//     first?: mixed_Node;
//     second: { node: mixed_Node; leaf: { value: string; nested: { id: number } } };
//     leaf: { value: string; nested: { id: number } };
// };
export const mixed = batch<{ value: number; next: "ref" }>();
export const mixedAgain = batch<{ value: number; next: "ref" }>();

//// [defaultValue.ts]
function source() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

// A helper for an unnamed default follows the emitter's _default naming convention.
// Ideal declaration:
// type _default_recursive = readonly [number, _default_recursive];
// declare const _default: _default_recursive;
// export default _default;
export default source();

//// [defaultFunction.ts]
// Preserve the same convention when the unnamed default is a function declaration.
// Ideal declaration:
// type _default_recursive = readonly [string, _default_recursive];
// export default function (): _default_recursive;
export default function () {
    type Local = readonly [string, Local];
    return null as unknown as Local;
}

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
//// [quotedAnchor.d.ts]
export declare const quoted: {
    node: {
        next: typeof quoted.node;
    };
};
//// [wideAnchor.d.ts]
export declare const wide: {
    "0000000": {
        key: "0000000";
    };
    "0000001": {
        key: "0000001";
    };
    "0000010": {
        key: "0000010";
    };
    "0000011": {
        key: "0000011";
    };
    "0000100": {
        key: "0000100";
    };
    "0000101": {
        key: "0000101";
    };
    "0000110": {
        key: "0000110";
    };
    "0000111": {
        key: "0000111";
    };
    "0001000": {
        key: "0001000";
    };
    "0001001": {
        key: "0001001";
    };
    "0001010": {
        key: "0001010";
    };
    "0001011": {
        key: "0001011";
    };
    "0001100": {
        key: "0001100";
    };
    "0001101": {
        key: "0001101";
    };
    "0001110": {
        key: "0001110";
    };
    "0001111": {
        key: "0001111";
    };
    "0010000": {
        key: "0010000";
    };
    "0010001": {
        key: "0010001";
    };
    "0010010": {
        key: "0010010";
    };
    "0010011": {
        key: "0010011";
    };
    "0010100": {
        key: "0010100";
    };
    "0010101": {
        key: "0010101";
    };
    "0010110": {
        key: "0010110";
    };
    "0010111": {
        key: "0010111";
    };
    "0011000": {
        key: "0011000";
    };
    "0011001": {
        key: "0011001";
    };
    "0011010": {
        key: "0011010";
    };
    "0011011": {
        key: "0011011";
    };
    "0011100": {
        key: "0011100";
    };
    "0011101": {
        key: "0011101";
    };
    "0011110": {
        key: "0011110";
    };
    "0011111": {
        key: "0011111";
    };
    "0100000": {
        key: "0100000";
    };
    "0100001": {
        key: "0100001";
    };
    "0100010": {
        key: "0100010";
    };
    "0100011": {
        key: "0100011";
    };
    "0100100": {
        key: "0100100";
    };
    "0100101": {
        key: "0100101";
    };
    "0100110": {
        key: "0100110";
    };
    "0100111": {
        key: "0100111";
    };
    "0101000": {
        key: "0101000";
    };
    "0101001": {
        key: "0101001";
    };
    "0101010": {
        key: "0101010";
    };
    "0101011": {
        key: "0101011";
    };
    "0101100": {
        key: "0101100";
    };
    "0101101": {
        key: "0101101";
    };
    "0101110": {
        key: "0101110";
    };
    "0101111": {
        key: "0101111";
    };
    "0110000": {
        key: "0110000";
    };
    "0110001": {
        key: "0110001";
    };
    "0110010": {
        key: "0110010";
    };
    "0110011": {
        key: "0110011";
    };
    "0110100": {
        key: "0110100";
    };
    "0110101": {
        key: "0110101";
    };
    "0110110": {
        key: "0110110";
    };
    "0110111": {
        key: "0110111";
    };
    "0111000": {
        key: "0111000";
    };
    "0111001": {
        key: "0111001";
    };
    "0111010": {
        key: "0111010";
    };
    "0111011": {
        key: "0111011";
    };
    "0111100": {
        key: "0111100";
    };
    "0111101": {
        key: "0111101";
    };
    "0111110": {
        key: "0111110";
    };
    "0111111": {
        key: "0111111";
    };
    1000000: {
        key: "1000000";
    };
    1000001: {
        key: "1000001";
    };
    1000010: {
        key: "1000010";
    };
    1000011: {
        key: "1000011";
    };
    1000100: {
        key: "1000100";
    };
    1000101: {
        key: "1000101";
    };
    1000110: {
        key: "1000110";
    };
    1000111: {
        key: "1000111";
    };
    1001000: {
        key: "1001000";
    };
    1001001: {
        key: "1001001";
    };
    1001010: {
        key: "1001010";
    };
    1001011: {
        key: "1001011";
    };
    1001100: {
        key: "1001100";
    };
    1001101: {
        key: "1001101";
    };
    1001110: {
        key: "1001110";
    };
    1001111: {
        key: "1001111";
    };
    1010000: {
        key: "1010000";
    };
    1010001: {
        key: "1010001";
    };
    1010010: {
        key: "1010010";
    };
    1010011: {
        key: "1010011";
    };
    1010100: {
        key: "1010100";
    };
    1010101: {
        key: "1010101";
    };
    1010110: {
        key: "1010110";
    };
    1010111: {
        key: "1010111";
    };
    1011000: {
        key: "1011000";
    };
    1011001: {
        key: "1011001";
    };
    1011010: {
        key: "1011010";
    };
    1011011: {
        key: "1011011";
    };
    1011100: {
        key: "1011100";
    };
    1011101: {
        key: "1011101";
    };
    1011110: {
        key: "1011110";
    };
    1011111: {
        key: "1011111";
    };
    1100000: {
        key: "1100000";
    };
    1100001: {
        key: "1100001";
    };
    1100010: {
        key: "1100010";
    };
    1100011: {
        key: "1100011";
    };
    1100100: {
        key: "1100100";
    };
    1100101: {
        key: "1100101";
    };
    1100110: {
        key: "1100110";
    };
    1100111: {
        key: "1100111";
    };
    1101000: {
        key: "1101000";
    };
    1101001: {
        key: "1101001";
    };
    1101010: {
        key: "1101010";
    };
    1101011: {
        key: "1101011";
    };
    1101100: {
        key: "1101100";
    };
    1101101: {
        key: "1101101";
    };
    1101110: {
        key: "1101110";
    };
    1101111: {
        key: "1101111";
    };
    1110000: {
        key: "1110000";
    };
    1110001: {
        key: "1110001";
    };
    1110010: {
        key: "1110010";
    };
    1110011: {
        key: "1110011";
    };
    1110100: {
        key: "1110100";
    };
    1110101: {
        key: "1110101";
    };
    1110110: {
        key: "1110110";
    };
    1110111: {
        key: "1110111";
    };
    1111000: {
        key: "1111000";
    };
    1111001: {
        key: "1111001";
    };
    1111010: {
        key: "1111010";
    };
    1111011: {
        key: "1111011";
    };
    1111100: {
        key: "1111100";
    };
    1111101: {
        key: "1111101";
    };
    1111110: {
        key: "1111110";
    };
    1111111: {
        key: "1111111";
    };
    node: {
        next: typeof wide.node;
    };
};
//// [mutual.d.ts]
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
type left_recursive = {
    leftValue: number;
    right: {
        rightValue: string;
        left: left_recursive;
    };
};
export declare function left(): left_recursive;
export {};
//// [optional.d.ts]
type optional_recursive = {
    readonly value: number;
    next?: optional_recursive | undefined;
};
export declare const optional: {
    node?: optional_recursive | undefined;
};
type shared_recursive = {
    next: shared_recursive;
};
export declare const shared: {
    left?: shared_recursive | undefined;
    right?: shared_recursive | undefined;
};
export {};
//// [containers.d.ts]
type tree_recursive = (string | tree_recursive)[];
export declare function tree(): string | tree_recursive;
type tuple_recursive = readonly [number, tuple_recursive];
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
export interface collision_recursive {
    occupied: true;
}
type collision_recursive_1 = {
    next: collision_recursive_1;
};
export declare const collision: {
    node?: collision_recursive_1 | undefined;
};
export {};
//// [symbols.d.ts]
export declare const key: unique symbol;
type keyed_recursive = {
    next: keyed_recursive;
    [key]: number;
};
export declare const keyed: {
    node?: keyed_recursive | undefined;
};
export {};
//// [payload.d.ts]
export interface Payload {
    name: string;
}
//// [imported.d.ts]
import { Payload as Input } from "./payload";
type imported_recursive = {
    value: Input;
    next: imported_recursive;
};
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
//// [cacheSiblings.d.ts]
type mixed_recursive = {
    value: number;
    next: mixed_recursive;
};
export declare const mixed: {
    first?: mixed_recursive | undefined;
    second: {
        node: mixed_recursive;
        leaf: {
            value: string;
            nested: {
                id: number;
            };
        };
    };
    leaf: {
        value: string;
        nested: {
            id: number;
        };
    };
};
type mixedAgain_recursive = {
    value: number;
    next: mixedAgain_recursive;
};
export declare const mixedAgain: {
    first?: mixedAgain_recursive | undefined;
    second: {
        node: mixedAgain_recursive;
        leaf: {
            value: string;
            nested: {
                id: number;
            };
        };
    };
    leaf: {
        value: string;
        nested: {
            id: number;
        };
    };
};
export {};
//// [defaultValue.d.ts]
type _default_recursive = readonly [number, _default_recursive];
declare const _default: _default_recursive;
export default _default;
//// [defaultFunction.d.ts]
type _default_recursive = readonly [string, _default_recursive];
export default function (): _default_recursive;
export {};
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
