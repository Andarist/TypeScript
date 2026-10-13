// @strict: true
// @noEmit: true

// The source object type is pushed on the inference stack twice (once for the conditional type
// target and once for its true branch), and the nested Cond<Q, never> is a lazily created deferred
// conditional type with the same root as the outer Cond<R, Q>. Neither side is actually expanding,
// so inference should still reach Q.

type Cond<T, U> = T extends string ? { a: T; inner: () => Cond<U, never> } : { b: T };
declare function f<R, Q>(m: Cond<R, Q>): [R, Q];
interface Req { url: string }
declare const arg: { a: string; inner: () => { b: Req } };
const r = f(arg);
const check: [string, Req] = r;
