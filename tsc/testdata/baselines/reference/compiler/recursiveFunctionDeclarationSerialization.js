//// [tests/cases/compiler/recursiveFunctionDeclarationSerialization.ts] ////

//// [script.ts]
const scriptArrow = () => scriptArrow;
const scriptExpression = function () { return scriptExpression; };
function scriptDeclaration() { return scriptDeclaration; }

//// [exported.ts]
export const arrow = () => arrow;
export const expression = function () { return expression; };
export function declaration() { return declaration; }
export const annotated: () => typeof annotated = () => annotated;
export const first = () => second;
export const second = () => first;
export const generic = <T>(value: T) => generic;
export const finite = () => () => 1;
export const wrapped = { arrow };
export const tuple = [arrow] as const;
export const named = function self() { return self; };
export const broad: unknown = function self() { return self; };
export const contextual: () => unknown = function self() { return self; };
export const specialized = generic<number>;
export const annotatedParameter = (value: string | number) => annotatedParameter;
export const renamedParameter = (other: number | string) => renamedParameter;
export const optionalParameter = (value?: string) => optionalParameter;
export const restParameter = (...values: string[]) => restParameter;
export const nestedReturn = () => () => nestedReturn;
export const finiteObject = { call: (value: string) => ({ value }) };
export const finiteTuple = [(value: number) => [value] as const] as const;
export const nestedGeneric = <T>(value: T) => ({
    call: (other: T) => [value, other] as const,
});
export const instantiatedNested = nestedGeneric("text");
export const objectReturn = () => ({ call: objectReturn });
export const tupleReturn = () => [tupleReturn] as const;
export const shadowed = function self(shadowed: number) { return self; };

//// [consumer.ts]
import { arrow, expression, declaration, first, generic, finite, wrapped, tuple } from "./exported";
import { instantiatedNested, objectReturn, tupleReturn, shadowed } from "./exported";
const a: typeof arrow = arrow()()();
const b: typeof expression = expression()()();
const c: typeof declaration = declaration()()();
const d: typeof first = first()()();
const e: typeof generic = generic(1)("text")(true);
const f: number = finite()();
const g: typeof arrow = wrapped.arrow()();
const h: typeof arrow = tuple[0]()();
const invalid: number = arrow()()();
const nestedResult: readonly [string, string] = instantiatedNested.call("other");
instantiatedNested.call(1);
const objectCall: typeof objectReturn = objectReturn().call().call;
const tupleCall: typeof tupleReturn = tupleReturn()[0]()[0];
const shadowedCall: typeof shadowed = shadowed(1)(2);

//// [recursiveObject.ts]
export function recursiveObject<T>() {
    const value = {
        call: <U>(arg: U) => value,
        consume: (arg: T) => value,
    };
    return value;
}

const result = recursiveObject<number>().call("hello").consume(1);
type IsAny<T> = 0 extends (1 & T) ? true : false;
const notAny: false = null as unknown as IsAny<typeof result.call>;
const invalidCall: number = result.call;
result.consume("wrong");

//// [nestedNamedFunctions.ts]
export const nestedObject = { recur: () => nestedObject.recur };
export const nestedTuple = [() => nestedTuple[0]] as const;
export const object = { recur: function self() { return self; } };
export const tuple = [function self() { return self; }] as const;
export const factory = () => function self() { return self; };
export const method = { recur() { return method; } };
export const accessor = { get recur() { return accessor; } };
export function local() {
    function recur() { return recur; }
    return recur;
}

//// [recursiveStructures.ts]
export const object = { value: 1, next: () => object };
export const method = { value: 1, next() { return method; } };
export const accessor = { value: 1, get next() { return accessor; } };
export const tuple = [() => tuple] as const;
export const tupleObject = [{ next: () => tupleObject }] as const;
export const array = [() => array];
export const first = { next: () => second };
export const second = { next: () => first };
export const nested = { inner: { next() { return nested.inner; } } };
export const shadowed = { next: function self(shadowed: number) { return self; } };
export const memberTuple = [function self() { return self; }] as const;
export const memberArray = [function self() { return self; }];
export const quoted = { "a-b": function self() { return self; } };
export const numeric = { 0: function self() { return self; } };
export const key = Symbol();
export const computed = { [key]: function self() { return self; } };
export const union = Math.random() ? { next: () => union } : undefined;

function create<T>(value: T) {
    const result = { value, next: () => result };
    return result;
}
export const specialized = create("text");
export const broad: unknown = { next() { return this; } };
function createIndexed() {
    const value: { [key: string]: typeof value } = {};
    return value;
}
export const indexed = createIndexed();
function createMapped<T>() {
    const value: { [K in keyof T]: typeof value } = null!;
    return value;
}
export const mapped = createMapped<{ next: unknown }>();
function createAnnotated<T>(value: T) {
    const node: { value: T; next: () => typeof node } = { value, next: () => node };
    return node;
}
export const viaAnnotation = createAnnotated("text");

const objectValue: number = object.next().next().value;
const tupleValue: typeof tuple = tuple[0]()[0]();
const tupleObjectValue: typeof tupleObject = tupleObject[0].next();
const arrayValue: typeof array = array[0]()[0]();
const nestedValue: typeof nested.inner = nested.inner.next().next();
const specializedValue: string = specialized.next().next().value;
const invalidValue: number = specialized.next().value;

//// [recursiveAnnotations.ts]
declare const object: { next: typeof object };
declare const tuple: readonly [typeof tuple];
declare const array: Array<typeof array>;
declare const tupleFunction: readonly [() => typeof tupleFunction];
declare const tupleObject: readonly [{ next: typeof tupleObject }];
declare const objectTuple: { next: readonly [typeof objectTuple] };
declare const mapped: { [K in "next"]: typeof mapped };
declare const union: typeof union | undefined;
declare const conditional: true extends false ? never : typeof conditional;

//// [namedReferences.ts]
export type Link<T> = { value: T; next: Link<T> };
export type Callable<T> = { (value: T): Callable<T>; link: Link<T> };
export type Wrapped = ( { next: Wrapped } );
export declare const link: Link<string>;
export declare const callable: Callable<number>;
export const nextLink = link.next;
export const nextCallable = callable(1);
export const parenthesized = (function self() { return self; });
export const asserted = (function self() { return self; }) satisfies () => unknown;
export const widened: () => unknown = (function self() { return self; });
function createHidden<T>(value: T) {
    type Hidden = { value: T; next: Hidden };
    return null! as Hidden;
}
export const hiddenAlias = createHidden("text");
export const siblingHiddenAliases = { first: hiddenAlias, second: hiddenAlias };
export const methodKey = Symbol();
export class Methods {
    static recur() { return Methods.recur; }
    static "a-b"() { return Methods["a-b"]; }
    static [methodKey]() { return Methods[methodKey]; }
    recur() { return this.recur; }
}
export function overloaded(value: string): typeof overloaded;
export function overloaded(value: number): typeof overloaded;
export function overloaded(value: string | number) { return overloaded; }
const text: string = nextLink.next.value;
const invalid: number = nextLink.next.value;
nextCallable("wrong");

//// [hiddenReferences.ts]
export class Hidden {
    private static recur() { return Hidden.recur; }
    static expose() { return Hidden.recur; }
    protected next() { return this.next; }
    expose() { return this.next; }
}


//// [script.js]
"use strict";
const scriptArrow = () => scriptArrow;
const scriptExpression = function () { return scriptExpression; };
function scriptDeclaration() { return scriptDeclaration; }
//// [exported.js]
export const arrow = () => arrow;
export const expression = function () { return expression; };
export function declaration() { return declaration; }
export const annotated = () => annotated;
export const first = () => second;
export const second = () => first;
export const generic = (value) => generic;
export const finite = () => () => 1;
export const wrapped = { arrow };
export const tuple = [arrow];
export const named = function self() { return self; };
export const broad = function self() { return self; };
export const contextual = function self() { return self; };
export const specialized = generic;
export const annotatedParameter = (value) => annotatedParameter;
export const renamedParameter = (other) => renamedParameter;
export const optionalParameter = (value) => optionalParameter;
export const restParameter = (...values) => restParameter;
export const nestedReturn = () => () => nestedReturn;
export const finiteObject = { call: (value) => ({ value }) };
export const finiteTuple = [(value) => [value]];
export const nestedGeneric = (value) => ({
    call: (other) => [value, other],
});
export const instantiatedNested = nestedGeneric("text");
export const objectReturn = () => ({ call: objectReturn });
export const tupleReturn = () => [tupleReturn];
export const shadowed = function self(shadowed) { return self; };
//// [consumer.js]
import { arrow, expression, declaration, first, generic, finite, wrapped, tuple } from "./exported";
import { instantiatedNested, objectReturn, tupleReturn, shadowed } from "./exported";
const a = arrow()()();
const b = expression()()();
const c = declaration()()();
const d = first()()();
const e = generic(1)("text")(true);
const f = finite()();
const g = wrapped.arrow()();
const h = tuple[0]()();
const invalid = arrow()()();
const nestedResult = instantiatedNested.call("other");
instantiatedNested.call(1);
const objectCall = objectReturn().call().call;
const tupleCall = tupleReturn()[0]()[0];
const shadowedCall = shadowed(1)(2);
//// [recursiveObject.js]
export function recursiveObject() {
    const value = {
        call: (arg) => value,
        consume: (arg) => value,
    };
    return value;
}
const result = recursiveObject().call("hello").consume(1);
const notAny = null;
const invalidCall = result.call;
result.consume("wrong");
//// [nestedNamedFunctions.js]
export const nestedObject = { recur: () => nestedObject.recur };
export const nestedTuple = [() => nestedTuple[0]];
export const object = { recur: function self() { return self; } };
export const tuple = [function self() { return self; }];
export const factory = () => function self() { return self; };
export const method = { recur() { return method; } };
export const accessor = { get recur() { return accessor; } };
export function local() {
    function recur() { return recur; }
    return recur;
}
//// [recursiveStructures.js]
export const object = { value: 1, next: () => object };
export const method = { value: 1, next() { return method; } };
export const accessor = { value: 1, get next() { return accessor; } };
export const tuple = [() => tuple];
export const tupleObject = [{ next: () => tupleObject }];
export const array = [() => array];
export const first = { next: () => second };
export const second = { next: () => first };
export const nested = { inner: { next() { return nested.inner; } } };
export const shadowed = { next: function self(shadowed) { return self; } };
export const memberTuple = [function self() { return self; }];
export const memberArray = [function self() { return self; }];
export const quoted = { "a-b": function self() { return self; } };
export const numeric = { 0: function self() { return self; } };
export const key = Symbol();
export const computed = { [key]: function self() { return self; } };
export const union = Math.random() ? { next: () => union } : undefined;
function create(value) {
    const result = { value, next: () => result };
    return result;
}
export const specialized = create("text");
export const broad = { next() { return this; } };
function createIndexed() {
    const value = {};
    return value;
}
export const indexed = createIndexed();
function createMapped() {
    const value = null;
    return value;
}
export const mapped = createMapped();
function createAnnotated(value) {
    const node = { value, next: () => node };
    return node;
}
export const viaAnnotation = createAnnotated("text");
const objectValue = object.next().next().value;
const tupleValue = tuple[0]()[0]();
const tupleObjectValue = tupleObject[0].next();
const arrayValue = array[0]()[0]();
const nestedValue = nested.inner.next().next();
const specializedValue = specialized.next().next().value;
const invalidValue = specialized.next().value;
//// [recursiveAnnotations.js]
"use strict";
//// [namedReferences.js]
export const nextLink = link.next;
export const nextCallable = callable(1);
export const parenthesized = (function self() { return self; });
export const asserted = (function self() { return self; });
export const widened = (function self() { return self; });
function createHidden(value) {
    return null;
}
export const hiddenAlias = createHidden("text");
export const siblingHiddenAliases = { first: hiddenAlias, second: hiddenAlias };
export const methodKey = Symbol();
export class Methods {
    static recur() { return Methods.recur; }
    static "a-b"() { return Methods["a-b"]; }
    static [methodKey]() { return Methods[methodKey]; }
    recur() { return this.recur; }
}
export function overloaded(value) { return overloaded; }
const text = nextLink.next.value;
const invalid = nextLink.next.value;
nextCallable("wrong");
//// [hiddenReferences.js]
export class Hidden {
    static recur() { return Hidden.recur; }
    static expose() { return Hidden.recur; }
    next() { return this.next; }
    expose() { return this.next; }
}


//// [script.d.ts]
declare const scriptArrow: () => typeof scriptArrow;
declare const scriptExpression: () => typeof scriptExpression;
declare function scriptDeclaration(): typeof scriptDeclaration;
//// [exported.d.ts]
export declare const arrow: () => typeof arrow;
export declare const expression: () => typeof expression;
export declare function declaration(): typeof declaration;
export declare const annotated: () => typeof annotated;
export declare const first: () => typeof second;
export declare const second: () => typeof first;
export declare const generic: <T>(value: T) => typeof generic;
export declare const finite: () => () => number;
export declare const wrapped: {
    arrow: typeof arrow;
};
export declare const tuple: readonly [typeof arrow];
export declare const named: () => typeof named;
export declare const broad: unknown;
export declare const contextual: () => unknown;
export declare const specialized: (value: number) => typeof generic;
export declare const annotatedParameter: (value: string | number) => typeof annotatedParameter;
export declare const renamedParameter: (other: number | string) => typeof renamedParameter;
export declare const optionalParameter: (value?: string) => typeof optionalParameter;
export declare const restParameter: (...values: string[]) => typeof restParameter;
export declare const nestedReturn: () => () => typeof nestedReturn;
export declare const finiteObject: {
    call: (value: string) => {
        value: string;
    };
};
export declare const finiteTuple: readonly [(value: number) => readonly [number]];
export declare const nestedGeneric: <T>(value: T) => {
    call: (other: T) => readonly [T, T];
};
export declare const instantiatedNested: {
    call: (other: string) => readonly [string, string];
};
export declare const objectReturn: () => {
    call: typeof objectReturn;
};
export declare const tupleReturn: () => readonly [typeof tupleReturn];
export declare const shadowed: (shadowed: number) => typeof import("./exported").shadowed;
//// [consumer.d.ts]
export {};
//// [nestedNamedFunctions.d.ts]
export declare const nestedObject: {
    recur: () => () => (typeof nestedObject)["recur"];
};
export declare const nestedTuple: readonly [() => () => (typeof nestedTuple)[0]];
export declare const object: {
    recur: () => () => (typeof object)["recur"];
};
export declare const tuple: readonly [() => () => (typeof tuple)[0]];
type factory_1 = () => factory_1;
export declare const factory: () => () => factory_1;
export declare const method: {
    recur(): typeof method;
};
export declare const accessor: {
    readonly recur: typeof accessor;
};
type local_1 = () => local_1;
export declare function local(): local_1;
export {};
//// [recursiveStructures.d.ts]
export declare const object: {
    value: number;
    next: () => typeof object;
};
export declare const method: {
    value: number;
    next(): typeof method;
};
export declare const accessor: {
    value: number;
    readonly next: typeof accessor;
};
export declare const tuple: readonly [() => typeof tuple];
export declare const tupleObject: readonly [{
    readonly next: () => typeof tupleObject;
}];
export declare const array: (() => typeof array)[];
export declare const first: {
    next: () => {
        next: () => typeof first;
    };
};
export declare const second: {
    next: () => {
        next: () => typeof second;
    };
};
export declare const nested: {
    inner: {
        next(): {
            next(): (typeof nested)["inner"];
        };
    };
};
export declare const shadowed: {
    next: (shadowed: number) => (shadowed: number) => typeof import("./recursiveStructures").shadowed["next"];
};
export declare const memberTuple: readonly [() => () => (typeof memberTuple)[0]];
export declare const memberArray: (() => (typeof memberArray)[0])[];
export declare const quoted: {
    "a-b": () => () => (typeof quoted)["a-b"];
};
export declare const numeric: {
    0: () => () => (typeof numeric)[0];
};
export declare const key: unique symbol;
export declare const computed: {
    [key]: () => (typeof computed)[typeof key];
};
export declare const union: {
    next: () => typeof union;
} | undefined;
export declare const specialized: {
    value: string;
    next: () => typeof specialized;
};
export declare const broad: unknown;
export declare const indexed: {
    [key: string]: typeof indexed;
};
export declare const mapped: {
    next: typeof mapped;
};
export declare const viaAnnotation: {
    value: string;
    next: () => typeof viaAnnotation;
};
//// [recursiveAnnotations.d.ts]
declare const object: {
    next: typeof object;
};
declare const tuple: readonly [typeof tuple];
declare const array: Array<typeof array>;
declare const tupleFunction: readonly [() => typeof tupleFunction];
declare const tupleObject: readonly [{
    next: typeof tupleObject;
}];
declare const objectTuple: {
    next: readonly [typeof objectTuple];
};
declare const mapped: {
    [K in "next"]: typeof mapped;
};
declare const union: typeof union | undefined;
declare const conditional: true extends false ? never : typeof conditional;
//// [namedReferences.d.ts]
export type Link<T> = {
    value: T;
    next: Link<T>;
};
export type Callable<T> = {
    (value: T): Callable<T>;
    link: Link<T>;
};
export type Wrapped = ({
    next: Wrapped;
});
export declare const link: Link<string>;
export declare const callable: Callable<number>;
export declare const nextLink: Link<string>;
export declare const nextCallable: Callable<number>;
export declare const parenthesized: () => typeof parenthesized;
export declare const asserted: () => typeof asserted;
export declare const widened: () => unknown;
export declare const hiddenAlias: {
    value: string;
    next: typeof hiddenAlias;
};
export declare const siblingHiddenAliases: {
    first: {
        value: string;
        next: (typeof siblingHiddenAliases)["first"];
    };
    second: {
        value: string;
        next: (typeof siblingHiddenAliases)["second"];
    };
};
export declare const methodKey: unique symbol;
export declare class Methods {
    static recur(): (typeof Methods)["recur"];
    static "a-b"(): (typeof Methods)["a-b"];
    static [methodKey](): (typeof Methods)[typeof methodKey];
    recur(): () => Methods["recur"];
}
export declare function overloaded(value: string): typeof overloaded;
export declare function overloaded(value: number): typeof overloaded;
//// [hiddenReferences.d.ts]
type Hidden_1 = () => Hidden_1;
type Hidden_2 = () => Hidden_2;
type Hidden_3 = () => Hidden_3;
export declare class Hidden {
    private static recur;
    static expose(): Hidden_1;
    protected next(): Hidden_2;
    expose(): Hidden_3;
}
export {};
