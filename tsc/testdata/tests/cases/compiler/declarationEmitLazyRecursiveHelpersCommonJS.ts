// @allowJs: true
// @checkJs: true
// @strict: true
// @target: es2015
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: mod.js
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

// @filename: consumer.ts
import { K } from "./mod";
// @ts-expect-error The synthesized helper is private to its declaration module.
import type { K_recursive } from "./mod";
const value: number = new K().values().values().value;
