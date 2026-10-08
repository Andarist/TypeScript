// @strict: true
// @exactOptionalPropertyTypes: false, true
// @noEmit: true

type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; value: E };
type OptionalOk<T> = { ok?: true; value: T };
type MaybeErr<E> = { ok?: false; value: E };

declare function ok<const T>(value: T): Ok<T>;
declare function optionalOk<const T>(value: T): OptionalOk<T>;

// A required false tag cannot match true | undefined.
export function optionalTarget(): OptionalOk<string[]> | Err<string> {
    return optionalOk([]);
}

// An optional false tag cannot match a required true tag.
export function optionalSource(): Ok<string[]> | MaybeErr<string> {
    return ok([]);
}

// Both tags may be absent, so the optional error member still contributes candidates.
export function bothOptional(): OptionalOk<string[]> | MaybeErr<string> {
    return optionalOk([]);
}

// A missing source tag does not prove incompatibility with an optional target tag.
export function missingSourceTag(): OptionalOk<string[]> | { value: string } {
    return optionalOk([]);
}

type ExplicitOptionalOk<T> = { ok?: true | undefined; value: T };
type UnionOk<T> = { ok: true | undefined; value: T };
declare function explicitOptionalOk<const T>(value: T): ExplicitOptionalOk<T>;
declare function unionOk<const T>(value: T): UnionOk<T>;

// Explicit undefined is retained in both optional-property modes.
export function explicitUndefined(): ExplicitOptionalOk<string[]> | Err<string> {
    return explicitOptionalOk([]);
}

// A required union-valued tag is treated the same as the overlapping optional tag.
export function requiredUnionTag(): UnionOk<string[]> | Err<string> {
    return unionOk([]);
}

type AlwaysUndefinedErr<E> = { ok: undefined; value: E };
type UndefinedOk<T> = { ok: undefined; value: T };
declare function undefinedOk<const T>(value: T): UndefinedOk<T>;

// With EOPT, present undefined cannot match an optional true tag that only permits absence.
export function undefinedSource(): OptionalOk<string[]> | AlwaysUndefinedErr<string> {
    return optionalOk([]);
}

// With EOPT, an optional false tag cannot match a required, present undefined tag.
export function undefinedTarget(): UndefinedOk<string[]> | MaybeErr<string> {
    return undefinedOk([]);
}

// Explicit undefined remains a valid overlap even with EOPT enabled.
export function explicitUndefinedOverlap(): ExplicitOptionalOk<string[]> | AlwaysUndefinedErr<string> {
    return explicitOptionalOk([]);
}
