//// [tests/cases/compiler/provesTypePredicates.ts] ////

//// [provesTypePredicates.ts]
export function isSmallNumber(x: string | number): proves x is number {
    return typeof x === "number" && Math.abs(x) < 10;
}

declare let value: string | number;

if (isSmallNumber(value)) {
    const n: number = value;
    const s: string = value; // error
}
else {
    const original: string | number = value;
    const s: string = value; // error
}

if (!isSmallNumber(value)) {
    const original: string | number = value;
    const s: string = value; // error
}

if (isSmallNumber(value) === false) {
    const original: string | number = value;
    const s: string = value; // error
}

if (isSmallNumber(value) && value.toFixed()) {
    const n: number = value;
}

isSmallNumber(value) || value.length; // error: the right side observes the unchanged type

const formattedOrOriginal = isSmallNumber(value) ? value.toFixed() : value;

if (!isSmallNumber(value) || typeof value === "string") {
    const original: string | number = value;
}

declare const maybeSmallNumber: typeof isSmallNumber | undefined;
if (maybeSmallNumber?.(value)) {
    const n: number = value;
}
else {
    const original: string | number = value;
}

class Base {
    isDerived(): proves this is Derived {
        return this instanceof Derived && Math.random() > 0.5;
    }
}

class Derived extends Base {
    derived = true;
}

declare const base: Base;
if (base.isDerived()) {
    base.derived;
}
else {
    base.derived; // error
}

declare let twoSided: (x: unknown) => x is string;
declare let oneSided: (x: unknown) => proves x is string;
declare let booleanFunction: (x: unknown) => boolean;

oneSided = twoSided;
twoSided = oneSided; // error
booleanFunction = oneSided;
oneSided = booleanFunction; // error

export function isShortString(x: unknown) {
    return typeof x === "string" && x.length < 10;
}

export function isString(x: unknown) {
    return typeof x === "string";
}

if (isShortString(value)) {
    const s: string = value;
}
else {
    const original: string | number = value;
}

if (isString(value)) {
    const s: string = value;
}
else {
    const n: number = value;
}

const values: (string | number)[] = ["a", 1, 100];
const smallNumbers: number[] = values.filter(isSmallNumber);
const inferredSmallNumbers: number[] = values.filter(x => typeof x === "number" && x < 10);
const foundSmallNumber: number | undefined = values.find(isSmallNumber);

declare const unionPredicate: typeof twoSided | typeof oneSided;
if (unionPredicate(value)) {
    const s: string = value;
}
else {
    const original: string | number = value;
    const s: string = value; // error
}

const proves = 1;
type proves = string;
const contextualKeyword: proves = "ok";


//// [provesTypePredicates.js]
export function isSmallNumber(x) {
    return typeof x === "number" && Math.abs(x) < 10;
}
if (isSmallNumber(value)) {
    const n = value;
    const s = value; // error
}
else {
    const original = value;
    const s = value; // error
}
if (!isSmallNumber(value)) {
    const original = value;
    const s = value; // error
}
if (isSmallNumber(value) === false) {
    const original = value;
    const s = value; // error
}
if (isSmallNumber(value) && value.toFixed()) {
    const n = value;
}
isSmallNumber(value) || value.length; // error: the right side observes the unchanged type
const formattedOrOriginal = isSmallNumber(value) ? value.toFixed() : value;
if (!isSmallNumber(value) || typeof value === "string") {
    const original = value;
}
if (maybeSmallNumber?.(value)) {
    const n = value;
}
else {
    const original = value;
}
class Base {
    isDerived() {
        return this instanceof Derived && Math.random() > 0.5;
    }
}
class Derived extends Base {
    constructor() {
        super(...arguments);
        this.derived = true;
    }
}
if (base.isDerived()) {
    base.derived;
}
else {
    base.derived; // error
}
oneSided = twoSided;
twoSided = oneSided; // error
booleanFunction = oneSided;
oneSided = booleanFunction; // error
export function isShortString(x) {
    return typeof x === "string" && x.length < 10;
}
export function isString(x) {
    return typeof x === "string";
}
if (isShortString(value)) {
    const s = value;
}
else {
    const original = value;
}
if (isString(value)) {
    const s = value;
}
else {
    const n = value;
}
const values = ["a", 1, 100];
const smallNumbers = values.filter(isSmallNumber);
const inferredSmallNumbers = values.filter(x => typeof x === "number" && x < 10);
const foundSmallNumber = values.find(isSmallNumber);
if (unionPredicate(value)) {
    const s = value;
}
else {
    const original = value;
    const s = value; // error
}
const proves = 1;
const contextualKeyword = "ok";


//// [provesTypePredicates.d.ts]
export declare function isSmallNumber(x: string | number): proves x is number;
export declare function isShortString(x: unknown): proves x is string;
export declare function isString(x: unknown): x is string;
