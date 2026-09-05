// @strict: true

f(() => null as A, 2);
declare function f(cb: () => A, tag: 1): void;
declare function f(cb: () => A, tag: 2): void;
type A = A;
