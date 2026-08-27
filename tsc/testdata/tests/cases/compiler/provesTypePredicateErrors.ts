// @strict: true

function missingIs(x: unknown): proves x string {
    return true;
}

function missingType(x: unknown): proves x is {
    return true;
}

function combined(x: unknown): asserts proves x is string {
}

class A { a = 0; }
class B extends A { b = 0; }
class C extends A { c = 0; }

function nonBooleanReturn(x: unknown): proves x is string {
    return "yes";
}

function incompatiblePredicateType(x: B): proves x is C {
    return true;
}

function unknownParameter(y: unknown): proves x is string {
    return true;
}

function restParameter(...values: unknown[]): proves values is string[] {
    return true;
}

declare const provesC: (x: A) => proves x is C;
declare let provesB: (x: A) => proves x is B;
provesB = provesC;

declare let firstParameter: (x: A, y: A) => proves x is C;
declare const secondParameter: (x: A, y: A) => proves y is C;
firstParameter = secondParameter;

let invalidPosition: proves x is A;
