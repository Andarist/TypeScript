// @strict: true
// @noEmit: true

declare const MakeClass: <Self, T>() => {
  [K in keyof Self]: () => Self[K];
} & {
  new (args: T): T;
};

class Demo extends MakeClass<
  Demo,
  {
    a: number;
  }
>() {}

const result1 = Demo.a();

declare const MakeClass2: <Self>() => {
  [K in keyof Self]: () => Self[K];
} & {
  new (): {};
};

class Demo2 extends MakeClass2<Demo2>() {
  constructor(readonly foo: string) {
    super();
  }
}

const result2 = Demo2.foo();
