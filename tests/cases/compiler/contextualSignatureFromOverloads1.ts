// @strict: true
// @noEmit: true

export type Fn = {
  <t>(s: string): void;
  <t>(t: t): void;
};

export const fn: Fn = (first) => {};

export type Fn2 = {
  (s: string): void;
  <t>(t: t): void;
};

export const fn2: Fn2 = (first) => {};
