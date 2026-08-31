// @strict: true
// @noEmit: true

declare const EffectTypeId: unique symbol;

type Covariant<A> = (_: never) => A;

interface Effect<out A, out E = never, out R = never> {
    readonly [EffectTypeId]: {
        readonly _A: Covariant<A>;
        readonly _E: Covariant<E>;
        readonly _R: Covariant<R>;
    };
}

declare const succeed: <A>(value: A) => Effect<A>;

type AddEnvironment<X, Y> = Y extends { _type: infer Z }
    ? X extends Effect<infer A, infer E, infer R>
        ? Effect<A, E, R | Z>
        : X
    : X;

declare const implement: <T>() => <I extends readonly any[], X>(
    callback: (...args: I) => X,
) => (...args: I) => AddEnvironment<X, T>;

function make<P>() {
    return implement<P>()(<N extends number>(value: N) => succeed(value));
}

function makeReverse<P>() {
    return implement<P>()(<N extends number>(value: N) => succeed(value));
}

interface A { readonly _type: "a" }
interface B { readonly _type: "b" }

export const a = make<A>()(1);
export const b = make<B>()(2);
export const bFirst = makeReverse<B>()(3);
export const aSecond = makeReverse<A>()(4);
