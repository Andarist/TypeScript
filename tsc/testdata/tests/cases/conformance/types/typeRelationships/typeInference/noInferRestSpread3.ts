// @strict: true
// @noEmit: true

type Mixed = [number] | NoInfer<[string]>;
type PlainMixed = [number] | [string];

declare let mixedFunction: (...args: Mixed) => void;
declare let plainFunction: (...args: PlainMixed) => void;
declare let zeroFunction: () => void;

mixedFunction = plainFunction;
plainFunction = mixedFunction;
mixedFunction = zeroFunction;
zeroFunction = mixedFunction; // currently accepted
zeroFunction = plainFunction; // currently accepted

declare function direct(...args: Mixed): void;

direct(1);
direct('');
direct(); // error
direct(true); // error
direct(1, 2); // error

declare const mixed: Mixed;
direct(...mixed);

declare function takesCallback(callback: (...args: Mixed) => void): void;

takesCallback(value => {
  const result: string | number = value;
});
takesCallback((value: string | number) => {});
takesCallback((value: number) => {}); // error
takesCallback((...args) => {
  const first: string | number = args[0];
  args;
});

function directIdentity(...args: Mixed) {
  return args;
}

type ArityMixed = [number] | NoInfer<[string, boolean]>;

declare function arity(...args: ArityMixed): void;

arity(1);
arity('', true);
arity(''); // error
arity(1, true); // error
arity('', false, 0); // error

declare function takesArityCallback(callback: (...args: ArityMixed) => void): void;

takesArityCallback((...args) => {
  args;
});
takesArityCallback((first, second) => { // error
  const firstResult: string | number = first;
  const secondResult: boolean | undefined = second;
});
takesArityCallback((first: string | number, second?: boolean) => {});
takesArityCallback((first: string | number, second: boolean) => {}); // error

type PlainArityMixed = [number] | [string, boolean];
declare function takesPlainArityCallback(callback: (...args: PlainArityMixed) => void): void;

takesPlainArityCallback((first, second) => {}); // error

declare function inferFromRest<C extends string>(
  source: C,
  ...args: [number] | NoInfer<[C]>
): C;

const inferredFromSource1 = inferFromRest('source', 1);
const inferredFromSource2 = inferFromRest('source', 'source');
inferFromRest('source', 'other'); // error

declare function inferFromSpread<C extends string>(
  source: C,
  ...args: [...([number] | NoInfer<[C]>)]
): C;

const inferredFromSpreadSource1 = inferFromSpread('source', 1);
const inferredFromSpreadSource2 = inferFromSpread('source', 'source');
inferFromSpread('source', 'other'); // error

type SpreadMixed = [...Mixed];

function spreadIdentity(...args: SpreadMixed) {
  return args;
}

spreadIdentity(1);
spreadIdentity('');
spreadIdentity(true); // error
