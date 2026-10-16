//// [tests/cases/compiler/exportAssignmentMerging11.ts] ////

//// [ambient.d.ts]
declare module "ma" { export { v as pa } from "xa"; export const ma: 1; }
declare module "mb" { export { v as pb } from "xb"; export const mb: 1; }
declare module "xa" { type T = typeof import("mb"); interface O extends T { v: 0 } const o: O; export = o; }
declare module "xb" { type T = typeof import("ma"); interface O extends T { v: 0 } const o: O; export = o; }
declare module "ia" { type T = typeof import("ma"); interface O extends T { v: 0 } const o: O; export = o; }
declare module "ib" { type T = typeof import("mb"); interface O extends T { v: 0 } const o: O; export = o; }
declare module "mm" {
    const o: { x: 1 };
    export = o;
    export { v as a } from "ia";
    export { v as b } from "ib";
    export interface F1 {}
    export interface F2 {}
    export interface F3 {}
    export interface F4 {}
    export interface F5 {}
    export interface F6 {}
    export interface F7 {}
    export interface F8 {}
    export interface F9 {}
    export interface F10 {}
}

//// [main.ts]
/// <reference path="./ambient.d.ts" />
import type { F1 } from "mm";
export type K = F1;
declare const oxa: typeof import("xa");
declare const oxb: typeof import("xb");
declare function expand<X>(): { [K in keyof X]: X[K] };
export const obsA = expand<typeof oxa>();
export const obsB = expand<typeof oxb>();


//// [main.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obsB = exports.obsA = void 0;
exports.obsA = expand();
exports.obsB = expand();


//// [main.d.ts]
import type { F1 } from "mm";
export type K = F1;
export declare const obsA: {
    pb: 0;
    readonly mb: 1;
    v: 0;
};
export declare const obsB: {
    pa: 0;
    readonly ma: 1;
    v: 0;
};
