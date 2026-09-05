//// [tests/cases/compiler/overloadSpeculationPreservesCircularAliasDiagnostic.ts] ////

//// [overloadSpeculationPreservesCircularAliasDiagnostic.ts]
f(() => null as A, 2);
declare function f(cb: () => A, tag: 1): void;
declare function f(cb: () => A, tag: 2): void;
type A = A;


//// [overloadSpeculationPreservesCircularAliasDiagnostic.js]
"use strict";
f(() => null, 2);
