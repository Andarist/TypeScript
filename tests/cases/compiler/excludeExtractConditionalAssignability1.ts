// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/61870

type Test1 = { a: number, b: number };

type Problem<Base, Key extends keyof Base> = Omit<Base, Key>;

type Ex1                      = Problem<Problem<Test1, "a">, "b"> // ok
type Ex2<Test2 extends Test1> = Problem<Problem<Test2, "a">, "b"> // ok
type Ex3<Test2 extends Test1> = Problem<Problem<Test2, "a">, "c"> // error
type Ex4<Test2 extends Test1> = Problem<Problem<Test2, "a">, "a"> // error

type ExtractPick<T, K extends keyof T> = Pick<T, Extract<keyof T, K>>;

type Problem2<Base, Key extends keyof Base> = ExtractPick<Base, Key>;

type Ex5                      = Problem2<Problem2<Test1, "a" | "b">, "b"> // ok
type Ex6<Test2 extends Test1> = Problem2<Problem2<Test2, "a" | "b">, "b"> // ok
type Ex7<Test2 extends Test1> = Problem2<Problem2<Test2, "a" | "b">, "c"> // error
type Ex8<Test2 extends Test1> = Problem2<Problem2<Test2, "a">, "b"> // error

