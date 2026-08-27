// @strict: true
// @target: es2020
// @declaration: true

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
