// @strict: true
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: generic.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function mod<T>(): resolve<T>;

// These two cases are future targets. For now, keep TS5088 rather than hoisting
// helpers which would capture symbols from a function or returned signature scope.
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

// @filename: nested.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

// U belongs to the signature inside the helper, but the return type captures T
// from outside it. Keep TS5088 and emit no orphan helper for this declaration.
export function nested<T>() {
    return maybe<{ next: "ref"; read: <U>(value: U) => T }>();
}

// A top-level name with the same spelling must not make a captured parameter
// appear available in the helper's insertion scope. Keep TS5088 here as well.
export interface Captured {
    id: number;
}
export function shadowed<Captured>() {
    return maybe<{ next: "ref"; value: Captured }>();
}
