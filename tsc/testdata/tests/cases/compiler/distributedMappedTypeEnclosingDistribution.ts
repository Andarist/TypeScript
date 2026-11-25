// @strict: true
// @noEmit: true

type Show<A, B extends A> = [A, B];
type Check<X, Y extends X> = Y;

// Generic mapped types declared over a type variable distributed by an enclosing distributive context

type InMapped1<T> = { [K in keyof T]: Check<{ [P in keyof T]: T }, { [Q in keyof T]: T }> };
type InMapped2<T> = { [K in keyof T]: Check<{ [P in keyof T]: T[P] }, { [Q in keyof T]: T[Q] }> };
type InCond1<T> = T extends unknown ? Check<{ [P in keyof T]: T }, { [Q in keyof T]: T }> : never;
type InCond2<T> = T extends unknown ? Check<{ [P in keyof T]: T[P] }, { [Q in keyof T]: T[Q] }> : never;

type InMapped3<T, U extends T> = { [P in keyof T]: Show<{ [K in keyof T]: T[K] }, { [K in keyof T]: U[K] }> };  // Error
type InCond3<T, U extends T> = T extends unknown ? Show<{ [K in keyof T]: T[K] }, { [K in keyof T]: U[K] }> : never;  // Error
