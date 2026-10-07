//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpersNamespaces.ts] ////

//// [globalA.ts]
namespace A {
    export function make() {
        type Local = readonly [number, Local];
        return null as unknown as Local;
    }
}

//// [globalB.ts]
namespace B {
    export function make() {
        type Local = readonly [string, Local];
        return null as unknown as Local;
    }
}

//// [mergedA.ts]
namespace Shared {
    interface Payload { value: number; }
    export function numbers() {
        type Local = readonly [Payload, Local];
        return null as unknown as Local;
    }
}

//// [mergedB.ts]
namespace Shared {
    interface Payload { value: string; }
    export function strings() {
        type Local = readonly [Payload, Local];
        return null as unknown as Local;
    }
}

//// [globalRoot.ts]
type globalShow<T> = { [K in keyof T]: T[K] } & unknown;
type globalResolve<T> = globalShow<{
    [P in keyof T]: T[P] extends "ref" ? globalResolve<T> : T[P];
}>;
declare function globalMod<T>(): { node: globalResolve<T> };

const globalRoot = globalMod<{ value: number; next: "ref" }>();

//// [consumer.ts]
const rootValue: number = globalRoot.node.next.value;
const a: number = A.make()[0];
const b: string = B.make()[0];
const sharedNumber: number = Shared.numbers()[0].value;
const sharedString: string = Shared.strings()[0].value;

//// [model.ts]
export interface Payload { name: string; }

//// [namespaceImport.ts]
import * as Model from "./model";
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export const result = maybe<{ next: "ref"; value: Model.Payload }>();

//// [namespaceType.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };
export namespace N { export interface Payload { name: string; } }

export const result = maybe<{ next: "ref"; value: N.Payload }>();

//// [sharedScopes.ts]
export function sharedSource() {
    type Local = readonly [number, Local];
    return null as unknown as Local;
}
export namespace First {
    export const node = sharedSource();
}
export namespace Second {
    export const node = sharedSource();
}
const firstNodeValue: number = First.node[1][0];
const secondNodeValue: number = Second.node[1][0];




//// [globalA.d.ts]
declare namespace A {
    type make_1 = readonly [number, make_1];
    export function make(): make_1;
    export {};
}
//// [globalB.d.ts]
declare namespace B {
    type make_1 = readonly [string, make_1];
    export function make(): make_1;
    export {};
}
//// [mergedA.d.ts]
declare namespace Shared {
    interface Payload {
        value: number;
    }
    type numbers_1 = readonly [Payload, numbers_1];
    export function numbers(): numbers_1;
    export {};
}
//// [mergedB.d.ts]
declare namespace Shared {
    interface Payload {
        value: string;
    }
    type strings_1 = readonly [Payload, strings_1];
    export function strings(): strings_1;
    export {};
}
//// [globalRoot.d.ts]
type globalShow<T> = {
    [K in keyof T]: T[K];
} & unknown;
type globalResolve<T> = globalShow<{
    [P in keyof T]: T[P] extends "ref" ? globalResolve<T> : T[P];
}>;
declare function globalMod<T>(): {
    node: globalResolve<T>;
};
declare const globalRoot: {
    node: {
        value: number;
        next: (typeof globalRoot)["node"];
    };
};
//// [consumer.d.ts]
declare const rootValue: number;
declare const a: number;
declare const b: string;
declare const sharedNumber: number;
declare const sharedString: string;
//// [model.d.ts]
export interface Payload {
    name: string;
}
//// [namespaceImport.d.ts]
import * as Model from "./model";
type result_1 = {
    next: result_1;
    value: Model.Payload;
};
export declare const result: {
    node?: result_1 | undefined;
};
export {};
//// [namespaceType.d.ts]
export declare namespace N {
    interface Payload {
        name: string;
    }
}
type result_1 = {
    next: result_1;
    value: N.Payload;
};
export declare const result: {
    node?: result_1 | undefined;
};
export {};
//// [sharedScopes.d.ts]
type sharedSource_1 = readonly [number, sharedSource_1];
export declare function sharedSource(): sharedSource_1;
export declare namespace First {
    type node_1 = readonly [number, node_1];
    export const node: node_1;
    export {};
}
export declare namespace Second {
    type node_1_1 = readonly [number, node_1_1];
    export const node: node_1_1;
    export {};
}
export {};
