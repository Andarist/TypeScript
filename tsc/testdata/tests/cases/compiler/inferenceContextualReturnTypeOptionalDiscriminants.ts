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
