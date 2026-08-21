// @strict: true
// @noEmit: true

type Requires1 = [number] | [string];

declare let requires1Fn: (...args: Requires1) => void;
declare let zeroFn: () => void;

zeroFn = requires1Fn;
