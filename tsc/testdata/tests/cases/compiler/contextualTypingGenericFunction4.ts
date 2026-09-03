// @strict: true
// @declaration: true
// @emitDeclarationOnly: true

// Positional contextual typing requires matching type parameter lists.
export const matching: <T extends { id: string }, U extends T = T>(first: T, second: U) => U =
    <A extends { id: string }, B extends A = A>(first, second) => {
        const a: A = first;
        const b: B = second;
        a.id;
        return b;
    };

export const recursive: <T extends { next?: T }>(value: T) => T =
    <S extends { next?: S }>(value) => {
        const local: S = value;
        return local;
    };

declare function accept(callback: <T extends { id: string }, U extends T = T>(value: U) => U): void;

accept(<A extends { id: string }, B extends A = A>(value) => {
    const local: B = value;
    return local;
});

// Mismatches don't provide contextual parameter types (implicit any errors).
export const differentConstraint: <T extends string>(value: T) => void =
    <S extends string | number>(value) => {};

export const differentDefault: <T = string>(value: T) => void =
    <S = number>(value) => {};

export const missingDefault: <T = string>(value: T) => void =
    <S>(value) => {};

export const differentArity: <T, U>(first: T, second: U) => void =
    <S>(first, second) => {};

// This is only a contextual typing restriction, not an assignment compatibility restriction.
export const annotatedConstraint: <T extends string>(value: T) => T =
    <S extends string | number>(value: S) => value;

export const annotatedDefault: <T = string>(value: T) => T =
    <S = number>(value: S) => value;

export const annotatedReordered: <T, U>(first: T, second: U) => [T, U] =
    <A, B>(first: B, second: A): [B, A] => [first, second];
