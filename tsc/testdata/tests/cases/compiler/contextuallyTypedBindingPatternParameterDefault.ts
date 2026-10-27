// @strict: true
// @noEmit: true

type ObjectFn = (input?: { channel?: string; minutes?: number }) => number;
export const objectFn: ObjectFn = ({ channel, minutes } = {}) => (channel ? 1 : 0) + (minutes ?? 0);

type RequiredObjectFn = (input: { channel?: string }) => number;
export const requiredObjectFn: RequiredObjectFn = ({ channel } = {}) => (channel ? 1 : 0);

type TupleFn = (input?: [string?, number?]) => number;
export const tupleFn: TupleFn = ([channel, minutes] = []) => (channel ? 1 : 0) + (minutes ?? 0);

type RequiredTupleFn = (input: [string?]) => number;
export const requiredTupleFn: RequiredTupleFn = ([channel] = []) => (channel ? 1 : 0);

declare function call<T>(cb: (input?: { channel?: string }, tuple?: [string?]) => T): T;
call(({ channel } = {}, [first] = []) => channel ?? first);

// Not contextually typed, these should still be reported
export const uncontextualObject = ({ channel } = {}) => channel;
export const uncontextualTuple = ([channel] = []) => channel;
