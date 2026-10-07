//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpersCommonJS.ts] ////

//// [mod.js]
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
// @ts-expect-error
import type { K_1 } from "./mod";
const value: number = new K().values().values().value;




//// [mod.d.ts]
type K_1 = {
    value: number;
    values(): K_1;
};
export declare var K: {
    new (): K_1;
};
export {};
//// [consumer.d.ts]
export {};
