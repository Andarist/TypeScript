//// [tests/cases/compiler/inferredRestTypeFixedOnce.ts] ////

//// [inferredRestTypeFixedOnce.ts]
function wrap<Args extends unknown[]>(_: (...args: Args) => void) {}
wrap(({ cancelable } = {}) => {});
wrap(({ cancelable }) => {});
wrap((arg = {}) => {});
wrap((arg) => {});


//// [inferredRestTypeFixedOnce.js]
"use strict";
function wrap(_) { }
wrap(({ cancelable } = {}) => { });
wrap(({ cancelable }) => { });
wrap((arg = {}) => { });
wrap((arg) => { });
