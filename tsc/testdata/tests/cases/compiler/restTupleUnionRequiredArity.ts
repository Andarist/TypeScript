// @strict: true
// @noEmit: true

type Requires1 = [number] | [string];

declare let requires1Fn: (...args: Requires1) => void;
declare let zeroFn: () => void;

zeroFn = requires1Fn;

type Allows0 = [void] | [number];
declare let allows0Fn: (...args: Allows0) => void;

zeroFn = allows0Fn;
