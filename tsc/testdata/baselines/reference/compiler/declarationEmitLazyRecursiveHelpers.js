//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpers.ts] ////

//// [self.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<M, K extends keyof M> = show<{
    [P in keyof M[K]]: M[K][P] extends "ref" ? resolve<M, K> : M[K][P];
}>;
declare const mod: <M>() => { [K in keyof M]: resolve<M, K> };

export const n = mod<{ Node: { value: number; next: "ref" } }>();

//// [quotedAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): { "node": resolve<T> };

export const quoted = mod<{ next: "ref" }>();

//// [wideAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
type Bit = "0" | "1";
type Keys = `${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}`;
declare function mod<T>(): { [K in Keys | "node"]: K extends "node" ? resolve<T> : { key: K } };

export const wide = mod<{ next: "ref" }>();

//// [mutual.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<M, K extends keyof M> = show<{
    [P in keyof M[K]]: M[K][P] extends keyof M ? resolve<M, M[K][P]> : M[K][P];
}>;
declare const mod: <M>() => { [K in keyof M]: resolve<M, K> };

export const pair = mod<{
    Left: { leftValue: number; right: "Right" };
    Right: { rightValue: string; left: "Left" };
}>();

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

export const optional = maybe<{ readonly value: number; next?: "ref" }>();

declare function both<T>(): { left?: resolve<T>; right?: resolve<T> };
export const shared = both<{ next: "ref" }>();

//// [containers.ts]
export function tree() {
    type Local = string | Local[];
    return null as unknown as Local;
}

export function tuple() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

//// [signatures.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

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

export interface collision_1 {
    occupied: true;
}
export const collision = maybe<{ next: "ref" }>();

//// [symbols.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

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

export const imported = maybe<{ value: Input; next: "ref" }>();

//// [recursiveArray.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
function source() {
    type Local = show<{ next: Local[] }>;
    return null as unknown as Local["next"];
}

export const nodes = source();

//// [shadowedAnchor.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ value: T; read: (node: string) => resolve<T> }>;
declare function mod<T>(): resolve<T>;

export const node = mod<number>();

//// [classAnchor.ts]
export const ctor = class Inner {
    next(): Inner {
        return this;
    }
};

//// [instantiations.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

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

export const mixed = batch<{ value: number; next: "ref" }>();
export const mixedAgain = batch<{ value: number; next: "ref" }>();

//// [helperNames.ts]
export function makePair() {
    type Left = readonly [number, Left];
    type Right = readonly [string, Right];
    return { left: null as unknown as Left, right: null as unknown as Right };
}
export function other() {
    type Local = readonly [boolean, Local];
    return null as unknown as Local;
}

//// [helperNameCollisions.ts]
export interface makePair_1 { occupied: true; }
export const makePair_2 = 0;
export function makePair() {
    type Left = readonly [number, Left];
    type Right = readonly [string, Right];
    return { left: null as unknown as Left, right: null as unknown as Right };
}

//// [defaultValue.ts]
function source() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

export default source();

//// [defaultFunction.ts]
export default function () {
    type Local = readonly [string, Local];
    return null as unknown as Local;
}

//// [acyclic.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

export const leaf = mod<{ value: number; next: null }>();
export const siblings = {
    left: mod<{ value: number; next: null }>(),
    right: mod<{ value: number; next: null }>(),
};
export const finite = mod<{ value: number[][][] }>();

export interface Named {
    value: number;
    next: Named;
}
declare const source: Named;
export const named = source;

//// [existingReferences.ts]
export const arrow = () => arrow;
export const quoted = { "a-b": () => quoted["a-b"] };
export const tuple = [() => tuple[0]] as const;

function source() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}
export const mixed = {
    named: () => mixed.named,
    anonymous: source(),
};

export const factory = () => function self() { return self; };
export function local() {
    function recur() { return recur; }
    return recur;
}

//// [sharedMembers.ts]
export class Shared {
    protected next() { return this.next; }
    first() { return this.next; }
    second() { return this.next; }
}

function source<T>() {
    type Local = readonly [T, Local];
    return null as unknown as Local;
}
export class Instantiations {
    numbers() { return source<number>(); }
    numbersAgain() { return source<number>(); }
    strings() { return source<string>(); }
    stringsAgain() { return source<string>(); }
}




//// [self.d.ts]
export declare const n: {
    Node: {
        value: number;
        next: (typeof n)["Node"];
    };
};
//// [quotedAnchor.d.ts]
export declare const quoted: {
    node: {
        next: (typeof quoted)["node"];
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
        next: (typeof wide)["node"];
    };
};
//// [mutual.d.ts]
export declare const pair: {
    Left: {
        leftValue: number;
        right: {
            rightValue: string;
            left: (typeof pair)["Left"];
        };
    };
    Right: {
        rightValue: string;
        left: {
            leftValue: number;
            right: (typeof pair)["Right"];
        };
    };
};
type left_1 = {
    leftValue: number;
    right: {
        rightValue: string;
        left: left_1;
    };
};
export declare function left(): left_1;
export {};
//// [optional.d.ts]
type optional_1 = {
    readonly value: number;
    next?: optional_1 | undefined;
};
export declare const optional: {
    node?: optional_1 | undefined;
};
type shared_1 = {
    next: shared_1;
};
export declare const shared: {
    left?: shared_1 | undefined;
    right?: shared_1 | undefined;
};
export {};
//// [containers.d.ts]
type tree_1 = (string | tree_1)[];
export declare function tree(): string | tree_1;
type tuple_1 = readonly [number, tuple_1];
export declare function tuple(): tuple_1;
export {};
//// [signatures.d.ts]
type signatures_1 = {
    next: signatures_1;
    identity: <T>(value: T) => T;
    unwrap: <T>(value: T) => T extends readonly (infer U)[] ? U : T;
    copy: <T>(value: T) => { [K in keyof T]: T[K]; };
};
export declare const signatures: {
    node?: signatures_1 | undefined;
};
export {};
//// [collisions.d.ts]
export interface collision_1 {
    occupied: true;
}
type collision_2 = {
    next: collision_2;
};
export declare const collision: {
    node?: collision_2 | undefined;
};
export {};
//// [symbols.d.ts]
export declare const key: unique symbol;
type keyed_1 = {
    next: keyed_1;
    [key]: number;
};
export declare const keyed: {
    node?: keyed_1 | undefined;
};
export {};
//// [payload.d.ts]
export interface Payload {
    name: string;
}
//// [imported.d.ts]
import { Payload as Input } from "./payload";
type imported_1 = {
    value: Input;
    next: imported_1;
};
export declare const imported: {
    node?: imported_1 | undefined;
};
export {};
//// [recursiveArray.d.ts]
type nodes_1 = {
    next: nodes_1[];
};
export declare const nodes: nodes_1[];
export {};
//// [shadowedAnchor.d.ts]
export declare const node: {
    value: number;
    read: (node: string) => typeof import("./shadowedAnchor").node;
};
//// [classAnchor.d.ts]
type ctor_1 = {
    next(): ctor_1;
};
export declare const ctor: {
    new (): ctor_1;
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
type mixed_1 = {
    value: number;
    next: mixed_1;
};
export declare const mixed: {
    first?: mixed_1 | undefined;
    second: {
        node: mixed_1;
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
type mixedAgain_1 = {
    value: number;
    next: mixedAgain_1;
};
export declare const mixedAgain: {
    first?: mixedAgain_1 | undefined;
    second: {
        node: mixedAgain_1;
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
//// [helperNames.d.ts]
type makePair_1 = readonly [number, makePair_1];
type makePair_2 = readonly [string, makePair_2];
export declare function makePair(): {
    left: makePair_1;
    right: makePair_2;
};
type other_1 = readonly [boolean, other_1];
export declare function other(): other_1;
export {};
//// [helperNameCollisions.d.ts]
export interface makePair_1 {
    occupied: true;
}
export declare const makePair_2 = 0;
type makePair_3 = readonly [number, makePair_3];
type makePair_4 = readonly [string, makePair_4];
export declare function makePair(): {
    left: makePair_3;
    right: makePair_4;
};
export {};
//// [defaultValue.d.ts]
type _default_1 = readonly [number, _default_1];
declare const _default: _default_1;
export default _default;
//// [defaultFunction.d.ts]
type _default_1 = readonly [string, _default_1];
export default function (): _default_1;
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
//// [existingReferences.d.ts]
export declare const arrow: () => typeof arrow;
export declare const quoted: {
    "a-b": () => () => (typeof quoted)["a-b"];
};
export declare const tuple: readonly [() => () => (typeof tuple)[0]];
type mixed_1 = readonly [number, mixed_1];
export declare const mixed: {
    named: () => () => (typeof mixed)["named"];
    anonymous: mixed_1;
};
type factory_1 = () => factory_1;
export declare const factory: () => () => factory_1;
type local_1 = () => local_1;
export declare function local(): local_1;
export {};
//// [sharedMembers.d.ts]
type Shared_1 = () => Shared_1;
export declare class Shared {
    protected next(): Shared_1;
    first(): Shared_1;
    second(): Shared_1;
}
type Instantiations_1 = readonly [number, Instantiations_1];
type Instantiations_2 = readonly [string, Instantiations_2];
export declare class Instantiations {
    numbers(): Instantiations_1;
    numbersAgain(): Instantiations_1;
    strings(): Instantiations_2;
    stringsAgain(): Instantiations_2;
}
export {};
