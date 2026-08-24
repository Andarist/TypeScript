// @strict: true
// @noEmit: true

declare function doesStuff<T>(value: T, callback: (x: T) => T): T;

const result = doesStuff(undefined, x => {});

declare const maybeNumber: number | undefined;
const unionResult = doesStuff(maybeNumber, x => {});

const callback = () => {};
doesStuff(undefined, callback);
// @ts-expect-error An independently inferred void return should not become undefined when the type argument is fixed.
doesStuff<undefined>(undefined, callback);

// @ts-expect-error A contextual return type without undefined still requires a value.
doesStuff(1, x => {});
