// @strict: true
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: self.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<M, K extends keyof M> = show<{
    [P in keyof M[K]]: M[K][P] extends "ref" ? resolve<M, K> : M[K][P];
}>;
declare const mod: <M>() => { [K in keyof M]: resolve<M, K> };

export const n = mod<{ Node: { value: number; next: "ref" } }>();

// @filename: quotedAnchor.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): { "node": resolve<T> };

export const quoted = mod<{ next: "ref" }>();

// @filename: wideAnchor.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
type Bit = "0" | "1";
type Keys = `${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}`;
declare function mod<T>(): { [K in Keys | "node"]: K extends "node" ? resolve<T> : { key: K } };

export const wide = mod<{ next: "ref" }>();

// @filename: mutual.ts
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

// @filename: optional.ts
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

// @filename: containers.ts
export function tree() {
    type Local = string | Local[];
    return null as unknown as Local;
}

export function tuple() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

// @filename: signatures.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export const signatures = maybe<{
    next: "ref";
    identity: <T>(value: T) => T;
    unwrap: <T>(value: T) => T extends readonly (infer U)[] ? U : T;
    copy: <T>(value: T) => { [K in keyof T]: T[K] };
}>();

// @filename: collisions.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export interface collision_1 {
    occupied: true;
}
export const collision = maybe<{ next: "ref" }>();

// @filename: symbols.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export declare const key: unique symbol;
export const keyed = maybe<{ next: "ref"; [key]: number }>();

// @filename: payload.ts
export interface Payload {
    name: string;
}

// @filename: imported.ts
import { Payload as Input } from "./payload";
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export const imported = maybe<{ value: Input; next: "ref" }>();

// @filename: recursiveArray.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
function source() {
    type Local = show<{ next: Local[] }>;
    return null as unknown as Local["next"];
}

export const nodes = source();

// @filename: shadowedAnchor.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ value: T; read: (node: string) => resolve<T> }>;
declare function mod<T>(): resolve<T>;

export const node = mod<number>();

// @filename: classAnchor.ts
export const ctor = class Inner {
    next(): Inner {
        return this;
    }
};

// @filename: instantiations.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

export const numbers = mod<{ value: number; next: "ref" }>();
export const strings = mod<{ value: string; next: "ref" }>();
export const numbersAgain = mod<{ value: number; next: "ref" }>();

// @filename: cacheSiblings.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: T[P] extends "ref" ? resolve<T> : T[P] }>;
declare function batch<T>(): {
    first?: resolve<T>;
    second: { node: resolve<T>; leaf: { value: string; nested: { id: number } } };
    leaf: { value: string; nested: { id: number } };
};

export const mixed = batch<{ value: number; next: "ref" }>();
export const mixedAgain = batch<{ value: number; next: "ref" }>();

// @filename: helperNames.ts
export function makePair() {
    type Left = readonly [number, Left];
    type Right = readonly [string, Right];
    return { left: null as unknown as Left, right: null as unknown as Right };
}
export function other() {
    type Local = readonly [boolean, Local];
    return null as unknown as Local;
}

// @filename: helperNameCollisions.ts
export interface makePair_1 { occupied: true; }
export const makePair_2 = 0;
export function makePair() {
    type Left = readonly [number, Left];
    type Right = readonly [string, Right];
    return { left: null as unknown as Left, right: null as unknown as Right };
}

// @filename: defaultValue.ts
function source() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

export default source();

// @filename: defaultFunction.ts
export default function () {
    type Local = readonly [string, Local];
    return null as unknown as Local;
}

// @filename: acyclic.ts
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

// @filename: existingReferences.ts
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
