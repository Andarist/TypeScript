// @strict: true
// @noEmit: true

interface A {
  a: string;
}
interface B {
  b: number;
}
interface C {
  c: boolean;
}

function test1<T>(
  arg1: Exclude<Exclude<Exclude<T, A>, B>, C>,
  arg2: Exclude<T, A | B | C>,
) {
  arg1 = arg2;
  arg2 = arg1;
}

function test2<T>(
  arg1: Exclude<Exclude<T, A>, B>,
  arg2: Exclude<T, A | B | C>,
) {
  arg1 = arg2;
  arg2 = arg1; // error
}

function test3<T>(
  arg1: Exclude<Exclude<Exclude<T, A>, B>, C>,
  arg2: Exclude<T, A | B>,
) {
  arg1 = arg2; // error
  arg2 = arg1;
}

function test4<T>(
  arg1: Extract<Extract<Extract<T, A>, B>, C>,
  arg2: Extract<T, A & B & C>,
) {
  arg1 = arg2;
  arg2 = arg1;
}

function test5<T>(
  arg1: Extract<Extract<T, A>, B>,
  arg2: Extract<T, A & B & C>,
) {
  arg1 = arg2;
  arg2 = arg1; // error
}

function test6<T>(
  arg1: Extract<Extract<Extract<T, A>, B>, C>,
  arg2: Extract<T, A & B>,
) {
  arg1 = arg2; // error
  arg2 = arg1;
}

type WithoutA<T> = Exclude<T, A>;

function test7<T>(
  arg1: Exclude<WithoutA<T>, B>,
  arg2: Exclude<T, A | B>,
) {
  arg1 = arg2;
  arg2 = arg1;
}
