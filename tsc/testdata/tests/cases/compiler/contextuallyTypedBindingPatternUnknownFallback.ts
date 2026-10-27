// @strict: true
// @declaration: true
// @emitDeclarationOnly: true

declare function unknownRest<T extends unknown[]>(cb: (...args: T) => void): T;

export const object = unknownRest(({ a, b } = { a: 1 }) => {});
export const emptyObject = unknownRest(({ a } = {}) => {});
export const tuple = unknownRest(([first, second] = ["x"]) => {});
export const emptyTuple = unknownRest(([first] = []) => {});
export const nestedDefault = unknownRest(({ a, b = "x" } = { a: 1 }) => {});
export const nestedPattern = unknownRest(({ a: [first, second] } = { a: [1] }) => {});

// Without an initializer, the binding pattern is used
export const noInitializer = unknownRest(({ a, b }) => {});

// An any contextual type is used as is
declare function anyRest<T extends any[]>(cb: (...args: T) => void): T;
export const anyContext = anyRest(({ a, b } = { a: 1 }) => {});
