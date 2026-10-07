//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpersCommonJS.ts] ////

//// [mod.js]
// Keep a named CommonJS root's helper next to its constructor declaration.
// Ideal mod.d.ts:
// type K_recursive = { value: number; values(): K_recursive };
// export declare var K: { new (): K_recursive };
// export {};
var NS = {};
NS.K = class {
    value = 1;
    values() {
        return new NS.K();
    }
};
exports.K = NS.K;

//// [consumer.ts]
import { K } from "./mod";
// @ts-expect-error The synthesized helper is private to its declaration module.
import type { K_recursive } from "./mod";
const value: number = new K().values().values().value;




//// [mod.d.ts]
type K_recursive = {
    value: number;
    values(): K_recursive;
};
export declare var K: {
    new (): K_recursive;
};
export {};
//// [consumer.d.ts]
export {};
