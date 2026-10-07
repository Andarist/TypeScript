// @allowJs: true
// @checkJs: true
// @strict: true
// @target: es2015
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: mod.js
var NS = {};
NS.K = class {
    value = 1;
    values() {
        return new NS.K();
    }
};
exports.K = NS.K;

// @filename: consumer.ts
import { K } from "./mod";
// @ts-expect-error
import type { K_1 } from "./mod";
const value: number = new K().values().values().value;
