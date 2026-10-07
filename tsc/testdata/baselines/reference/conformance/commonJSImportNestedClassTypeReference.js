//// [tests/cases/conformance/salsa/commonJSImportNestedClassTypeReference.ts] ////

//// [main.js]
const { K } = require("./mod1");
/** @param {K} k */
function f(k) {
    k.values()
}

//// [mod1.js]
var NS = {}
NS.K =class {
    values() {
        return new NS.K()
    }
}
exports.K = NS.K;


//// [mod1.js]
"use strict";
var NS = {};
NS.K = class {
    values() {
        return new NS.K();
    }
};
exports.K = NS.K;
//// [main.js]
"use strict";
const { K } = require("./mod1");
/** @param {K} k */
function f(k) {
    k.values();
}


//// [mod1.d.ts]
type K_1 = {
    values(): K_1;
};
export declare var K: {
    new (): K_1;
};
export {};
//// [main.d.ts]
export {};
