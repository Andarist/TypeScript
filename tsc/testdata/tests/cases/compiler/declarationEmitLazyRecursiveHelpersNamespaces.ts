// @strict: true
// @declaration: true
// @emitDeclarationOnly: true
// @removeComments: true

// @filename: globalA.ts
namespace A {
    export function make() {
        type Local = readonly [number, Local];
        return null as unknown as Local;
    }
}

// @filename: globalB.ts
namespace B {
    export function make() {
        type Local = readonly [string, Local];
        return null as unknown as Local;
    }
}

// @filename: mergedA.ts
namespace Shared {
    interface Payload { value: number; }
    export function numbers() {
        type Local = readonly [Payload, Local];
        return null as unknown as Local;
    }
}

// @filename: mergedB.ts
namespace Shared {
    interface Payload { value: string; }
    export function strings() {
        type Local = readonly [Payload, Local];
        return null as unknown as Local;
    }
}

// @filename: globalRoot.ts
type globalShow<T> = { [K in keyof T]: T[K] } & unknown;
type globalResolve<T> = globalShow<{
    [P in keyof T]: T[P] extends "ref" ? globalResolve<T> : T[P];
}>;
declare function globalMod<T>(): { node: globalResolve<T> };

const globalRoot = globalMod<{ value: number; next: "ref" }>();

// @filename: consumer.ts
const rootValue: number = globalRoot.node.next.value;
const a: number = A.make()[0];
const b: string = B.make()[0];
const sharedNumber: number = Shared.numbers()[0].value;
const sharedString: string = Shared.strings()[0].value;

// @filename: model.ts
export interface Payload { name: string; }

// @filename: namespaceImport.ts
import * as Model from "./model";
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };

export const result = maybe<{ next: "ref"; value: Model.Payload }>();

// @filename: namespaceType.ts
type show<T> = { [K in keyof T]: T[K] } & unknown;
type resolve<T> = show<{ [P in keyof T]: P extends "next" ? resolve<T> : T[P] }>;
declare function maybe<T>(): { node?: resolve<T> };
export namespace N { export interface Payload { name: string; } }

export const result = maybe<{ next: "ref"; value: N.Payload }>();
