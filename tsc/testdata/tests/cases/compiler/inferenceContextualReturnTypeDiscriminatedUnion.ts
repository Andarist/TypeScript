// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/64690

type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; value: E };
declare function ok<const T>(value: T): Ok<T>;

export function f(): Ok<string[]> | Err<string> {
    return ok([]);
}

type Success<T> = { kind: "success"; value: T };
type Failure<E> = { kind: "failure"; value: E };
declare function success<const T>(value: T): Success<T>;

export function withStringTag(): Success<string[]> | Failure<string> {
    return success([]);
}

type Accepted<T> = { kind: 1; value: T };
type Rejected<E> = { kind: 0; value: E };
declare function accepted<const T>(value: T): Accepted<T>;

export function withNumberTag(): Accepted<string[]> | Rejected<string> {
    return accepted([]);
}

declare function unmatched<T>(): { kind: "other"; value: T };

// Neither union member matches the fixed tag, so T has no candidates and becomes unknown.
export function withUnmatchedTag(): Success<string[]> | Failure<number[]> {
    return unmatched();
}
