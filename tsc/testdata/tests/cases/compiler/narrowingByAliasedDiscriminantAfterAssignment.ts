// @strict: true
// @noEmit: true

type U = { kind: "a"; a: number } | { kind: "b"; b: string };

declare let replacement: U;

function equality(value: U) {
    const kind = value.kind;
    value = replacement;
    if (kind === "a") {
        value.a;
    }
}

function destructured(value: U) {
    const { kind } = value;
    value = replacement;
    if (kind === "a") {
        value.a;
    }
}

function switchAlias(value: U) {
    const kind = value.kind;
    value = replacement;
    switch (kind) {
        case "a":
            value.a;
    }
}

type TruthyU = { flag: true; a: number } | { flag: false; b: string };

declare let truthyReplacement: TruthyU;

function truthiness(value: TruthyU) {
    const flag = value.flag;
    value = truthyReplacement;
    if (flag) {
        value.a;
    }
}

type TypeofU = { data: "text"; a: number } | { data: 0; b: string };

declare let typeofReplacement: TypeofU;

function typeofAlias(value: TypeofU) {
    const data = value.data;
    value = typeofReplacement;
    if (typeof data === "string") {
        value.a;
    }
}

type OptionalU = { marker: "present"; a: number } | { marker: undefined; b: string };

declare let optionalReplacement: OptionalU;

function optionalAlias(value: OptionalU) {
    const marker = value.marker;
    value = optionalReplacement;
    if (marker?.length) {
        value.a;
    }
}

declare function assert(condition: unknown): asserts condition;

function assertionAlias(value: U) {
    const kind = value.kind;
    value = replacement;
    assert(kind === "a");
    value.a;
}

declare function assertA(kind: U["kind"]): asserts kind is "a";

function assertionPredicateAlias(value: U) {
    const kind = value.kind;
    value = replacement;
    assertA(kind);
    value.a;
}

declare let holderReplacement: { value: U };

function nestedRoot(holder: { value: U }) {
    const kind = holder.value.kind;
    holder = holderReplacement;
    if (kind === "a") {
        holder.value.a;
    }
}

function assignmentBeforeCapture(value: U) {
    value = replacement;
    const kind = value.kind;
    if (kind === "a") {
        value.a;
    }
}
