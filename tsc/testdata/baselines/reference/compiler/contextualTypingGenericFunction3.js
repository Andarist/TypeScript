//// [tests/cases/compiler/contextualTypingGenericFunction3.ts] ////

//// [contextualTypingGenericFunction3.ts]
// https://github.com/microsoft/TypeScript/issues/61791

declare const fn1: <T, Args extends Array<any>, Ret>(
  self: T,
  body: (this: T, ...args: Args) => Ret,
) => (...args: Args) => Ret;

export const result1 = fn1({ message: "foo" }, function (n: number) {
  this.message;
});

export const result2 = fn1({ message: "foo" }, function <N>(n: N) {
  this.message;
});

declare const fn2: <Args extends Array<any>, Ret>(
  body: (first: string, ...args: Args) => Ret,
) => (...args: Args) => Ret;

export const result3 = fn2(function <N>(first, n: N) {});

declare const fn3: <Args extends Array<any>, Ret>(
  body: (...args: Args) => (arg: string) => Ret,
) => (...args: Args) => Ret;

export const result4 = fn3(function <N>(n: N) {
  return (arg) => {
    return 10;
  };
});

declare function fn4<T, P>(config: {
  context: T;
  callback: (params: P) => (context: T, params: P) => number;
  other?: (arg: string) => void;
}): (params: P) => number;

export const result5 = fn4({
  context: 1,
  callback: <N,>(params: N) => {
    return (a, b) => a + 1;
  },
});

export const result6 = fn4({
  context: 1,
  callback: <N,>(params: N) => {
    return (a, b) => a + 1;
  },
  other: (_) => {}, // outer context-sensitive function
});

// should error
export const result7 = fn4({
  context: 1,
  callback: <N,>(params: N) => {
    return (a: boolean, b) => a ? 1 : 2;
  },
  other: (_) => {}, // outer context-sensitive function
});

// should error
export const result8 = fn4({
  context: 1,
  callback: <N,>(params: N) => {
    return (a, b) => true;
  },
  other: (_) => {}, // outer context-sensitive function
});

declare const fnGen1: <T, Args extends Array<any>, Ret>(
  self: T,
  body: (this: T, ...args: Args) => Generator<any, Ret, never>,
) => (...args: Args) => Ret;

export const result9 = fnGen1({ message: "foo" }, function* (n: number) {
  this.message;
});

export const result10 = fnGen1({ message: "foo" }, function* <N>(n: N) {
  this.message;
});

declare function fn5<P, Q>(config: {
  first: (params: P) => (params: P) => void;
  second: (params: Q) => (params: Q) => void;
}): (first: P, second: Q) => void;

export const result11 = fn5({
  first: <N extends { id: string }>(params: N) => value => {
    value.id;
  },
  second: <N>(params: N) => value => {
    value;
  },
});

declare function fn6<P>(callback: (params: P) => void): P;

export const result12 = fn6(<N>(params: string) => {});

export const result13: (value: string) => void = <N>(value) => {
  value.toUpperCase();
};




//// [contextualTypingGenericFunction3.d.ts]
export declare const result1: (n: number) => void;
export declare const result2: <N>(n: N) => void;
export declare const result3: <N>(n: N) => void;
export declare const result4: <N>(n: N) => number;
export declare const result5: <N>(params: N) => number;
export declare const result6: <N>(params: N) => number;
export declare const result7: (params: unknown) => number;
export declare const result8: (params: unknown) => number;
export declare const result9: (n: number) => void;
export declare const result10: <N>(n: N) => void;
export declare const result11: <N extends {
    id: string;
}, N1>(first: N, second: N1) => void;
export declare const result12: string;
export declare const result13: (value: string) => void;
