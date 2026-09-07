// @strict: true
// @noEmit: true

// Name resolution is kept across rolled-back overload attempts, and so are its
// diagnostics. Each unresolved name must be reported exactly once.
declare function f(a: number, cb: (x: number) => void): void;
declare function f(a: string, cb: (x: string) => void): void;

f("s", (x) => { missing1; x.toUpperCase(); });
f(1, (x) => { missing2; x.toFixed(); });
f(1, missing3);
f("s", missing4 + "");
