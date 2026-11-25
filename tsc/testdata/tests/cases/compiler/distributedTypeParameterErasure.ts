// @strict: true
// @noEmit: true

type Show<A, B extends A> = [A, B];
type Check<X, Y extends X> = Y;

// Errors, U is only assignable to the non-distributed T
type Bad1<T, U extends T> = T extends unknown ? Show<T, U> : never;
type Bad2<T, U extends T, X> = T extends unknown ? Show<X extends unknown ? T : never, X extends unknown ? U : never> : never;
type Bad3<T, U extends T, X> = T extends unknown ? Show<{ [K in keyof X]: T }, { [K in keyof X]: U }> : never;
type Bad4<T, U extends T> = T extends unknown ? Show<{ [K in "a"]: T }, { [K in "a"]: U }> : never;
type Bad5<T, U extends T> = T extends unknown ? Show<{ [K in "a"]: T }["a"], U> : never;
type Bad6<T, U extends T> = T extends unknown ? Show<<Z>(z: Z) => T, <Z>(z: Z) => U> : never;
type Bad7<T, U extends T> = T extends unknown ? Show<{ m<Z>(z: Z): T }, { m<Z>(z: Z): U }> : never;

// No errors
type Ok1<T> = T extends unknown ? Check<{ [P in keyof T]: T }, { [Q in keyof T]: T }> : never;
type Ok2<T, X> = T extends unknown ? Check<{ [K in keyof X]: T }, { [K in keyof X]: T }> : never;
type Ok3<T> = T extends unknown ? Check<T, { [K in "a"]: T }["a"]> : never;
type Ok4<T> = T extends unknown ? Check<(x: { [K in "a"]: T }["a"]) => void, (x: T) => void> : never;
type Ok5<T, X> = T extends unknown ? Check<(x: X extends unknown ? T : never) => T, <R>(x: X extends unknown ? R : never) => R> : never;
type Ok6<T, X> = T extends unknown ? Check<T, X extends unknown ? T : never> : never;
