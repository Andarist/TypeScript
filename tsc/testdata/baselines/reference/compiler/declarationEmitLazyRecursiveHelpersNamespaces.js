//// [tests/cases/compiler/declarationEmitLazyRecursiveHelpersNamespaces.ts] ////

//// [globalA.ts]
// Helpers must remain private to this namespace declaration, rather than becoming
// global aliases which collide with globalB.d.ts.
// Ideal globalA.d.ts:
// declare namespace A {
//     type make_Result = readonly [number, make_Result];
//     export function make(): make_Result;
//     export {};
// }
namespace A {
    export function make() {
        type Local = readonly [number, Local];
        return null as unknown as Local;
    }
}

//// [globalB.ts]
// Ideal globalB.d.ts: the same structure as A, with string instead of number.
// B.make()[0] must remain string even when consumers enable skipLibCheck.
namespace B {
    export function make() {
        type Local = readonly [string, Local];
        return null as unknown as Local;
    }
}

//// [mergedA.ts]
// A helper may use a name private to its namespace block. The original private
// interface must be late-painted alongside the helper, without exporting either.
// Ideal mergedA.d.ts:
// declare namespace Shared {
//     type numbers_Result = readonly [Payload, numbers_Result];
//     interface Payload { value: number; }
//     export function numbers(): numbers_Result;
//     export {};
// }
namespace Shared {
    interface Payload { value: number; }
    export function numbers() {
        type Local = readonly [Payload, Local];
        return null as unknown as Local;
    }
}

//// [mergedB.ts]
// This declaration's private Payload is distinct from mergedA.ts's Payload.
// Ideal mergedB.d.ts: the same structure as above for strings(), with string payloads.
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

// Global scripts can still close a cycle through an existing variable path.
// Ideal declaration (in addition to the existing source declarations above):
// declare const globalRoot: { node: { value: number; next: typeof globalRoot.node } };
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

// A namespace import is available at the helper's insertion scope.
// Ideal namespaceImport.d.ts:
// import * as Model from "./model";
// type result_Node = { next: result_Node; value: Model.Payload };
// export declare const result: { node?: result_Node };
export const result = maybe<{ next: "ref"; value: Model.Payload }>();

//// [namespaceType.ts]
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };
export namespace N { export interface Payload { name: string; } }

// The root N has namespace meaning, whereas N.Payload has type meaning.
// Ideal namespaceType.d.ts:
// type result_Node = { next: result_Node; value: N.Payload };
// export namespace N { interface Payload { name: string; } }
// export declare const result: { node?: result_Node };
export const result = maybe<{ next: "ref"; value: N.Payload }>();




//// [globalA.d.ts]
declare namespace A {
    type make_recursive = readonly [number, make_recursive];
    export function make(): make_recursive;
    export {};
}
//// [globalB.d.ts]
declare namespace B {
    type make_recursive = readonly [string, make_recursive];
    export function make(): make_recursive;
    export {};
}
//// [mergedA.d.ts]
declare namespace Shared {
    type numbers_recursive = readonly [Payload, numbers_recursive];
    interface Payload {
        value: number;
    }
    export function numbers(): numbers_recursive;
    export {};
}
//// [mergedB.d.ts]
declare namespace Shared {
    type strings_recursive = readonly [Payload, strings_recursive];
    interface Payload {
        value: string;
    }
    export function strings(): strings_recursive;
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
        next: typeof globalRoot.node;
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
type result_recursive = {
    next: result_recursive;
    value: Model.Payload;
};
import * as Model from "./model";
export declare const result: {
    node?: result_recursive | undefined;
};
export {};
//// [namespaceType.d.ts]
type result_recursive = {
    next: result_recursive;
    value: N.Payload;
};
export declare namespace N {
    interface Payload {
        name: string;
    }
}
export declare const result: {
    node?: result_recursive | undefined;
};
export {};
