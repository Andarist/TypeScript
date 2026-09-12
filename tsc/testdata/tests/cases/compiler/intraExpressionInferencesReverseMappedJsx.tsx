// @strict: true
// @jsx: react-jsx
// @noEmit: true

/// <reference path="/.lib/react16.d.ts" />

declare function Mapped<T>(props: {
    [K in keyof T]: {
        produce: (n: string) => T[K];
        consume: (x: T[K]) => void;
    };
}): JSX.Element;

const e1 = <Mapped a={{ produce: () => "hello", consume: x => x.toLowerCase() }} />;
const e2 = <Mapped a={{ produce: n => n, consume: x => x.toLowerCase() }} />;
const e3 = <Mapped a={{ produce() { return "hello"; }, consume: x => x.toLowerCase() }} />;
const e4 = <Mapped a={{ produce: n => n, consume: x => x.toFixed() }} />;
