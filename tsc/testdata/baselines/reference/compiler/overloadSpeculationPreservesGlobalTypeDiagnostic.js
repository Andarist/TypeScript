//// [tests/cases/compiler/overloadSpeculationPreservesGlobalTypeDiagnostic.ts] ////

//// [overloadSpeculationPreservesGlobalTypeDiagnostic.ts]
interface Array<T> { length: number; [n: number]: T }
interface Boolean {}
interface CallableFunction {}
interface Function {}
interface IArguments {}
interface NewableFunction {}
interface Number {}
interface Object {}
interface RegExp {}
interface String {}
interface Promise {}

declare function f(cb: (x: number) => number): number;
declare function f(cb: (x: string) => unknown): string;
f(async x => x);


//// [overloadSpeculationPreservesGlobalTypeDiagnostic.js]
"use strict";
f(async (x) => x);
