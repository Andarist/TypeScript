// @strict: true
// @target: es2023
// @noEmit: true

// The inner Effect<string, R> and Effect<string, Req> references are only created when the
// signatures of the function types that contain them are resolved, i.e. during inference and after
// the outer Effect references. Inference must not mistake that for infinite expansion.

interface Effect<out A, out R = never> {
  readonly _A: () => A;
  readonly _R: () => R;
  [Symbol.iterator](): Iterator<Effect<A, R>, A>;
}
declare function succeed<A>(value: A): Effect<A>;
declare function gen<Eff extends Effect<any, any>, AEff>(
  body: () => Generator<Eff, AEff, never>,
): () => Effect<AEff, Eff extends Effect<infer _A, infer R> ? R : never>;

interface Req { readonly url: string }
declare const req: Effect<Req, Req>;

type Make<P> = <R>(m: Effect<() => Effect<string, R>>) => [R];
declare const make: Make<unknown>;

const r1 = make(succeed(gen(function* () {
  yield* req;
  return "";
})));
const check1: [Req] = r1;

// Minimal form, with a property, a return type and a parameter type holding the inner reference

interface Box<T> { value: T }
declare function boxed<T>(x: T): Box<T>;
declare function lazyReturn<T>(x: T): () => Box<T>;
declare function lazyProp<T>(x: T): { inner: Box<T> };
declare function lazyParam<T>(x: T): (cb: Box<T>) => void;
declare function lazyDeep<T>(x: T): () => Box<() => Box<T>>;

interface Builder<P> {
  fromReturn<R>(m: Box<() => Box<R>>, p: P): [R];
  fromProp<R>(m: Box<{ inner: Box<R> }>, p: P): [R];
  fromParam<R>(m: Box<(cb: Box<R>) => void>, p: P): [R];
  fromDeep<R>(m: Box<() => Box<() => Box<R>>>, p: P): [R];
}
declare const b: Builder<number>;
declare const rq: Req;

const r2: [Req] = b.fromReturn(boxed(lazyReturn(rq)), 1);
const r3: [Req] = b.fromProp(boxed(lazyProp(rq)), 1);
const r4: [Req] = b.fromParam(boxed(lazyParam(rq)), 1);
const r5: [Req] = b.fromDeep(boxed(lazyDeep(rq)), 1);
