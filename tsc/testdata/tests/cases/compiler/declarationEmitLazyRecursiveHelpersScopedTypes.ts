// @strict: true
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: generic.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

export function make<T extends { id: string }>(value: T) {
    return { node: mod<{ value: T; next: "ref" }>(), label: value.id };
}

export function factory() {
    return <T>(value: T) => mod<{ value: T; next: "ref" }>();
}

// @filename: nested.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export function nested<T>() {
    return maybe<{ next: "ref"; read: <U>(value: U) => T }>();
}

export interface Captured {
    id: number;
}
export function shadowed<Captured>() {
    return maybe<{ next: "ref"; value: Captured }>();
}

// @filename: global.ts
function globalTree() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}

// @filename: namespace.ts
namespace Generic {
    export function make<T>() {
        type Local = readonly [T, Local];
        return null as unknown as Local;
    }
}
