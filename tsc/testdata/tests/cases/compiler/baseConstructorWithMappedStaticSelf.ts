declare const MakeClass: <Self, T>() => {
    [K in keyof Self]: () => Self[K];
} & {
    new(args: T): T;
};

class Demo extends MakeClass<Demo, { a: number }>() {}

const demo = new Demo({ a: 1 });
const instanceValue: number = demo.a;
const staticValue: number = Demo.a();
