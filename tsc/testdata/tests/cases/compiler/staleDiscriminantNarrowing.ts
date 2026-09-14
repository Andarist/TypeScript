// @strict: true
// @noEmit: true
// @noTypesAndSymbols: true

type U = { kind: "a"; a: number } | { kind: "b"; b: string };

declare const replacement: U;

declare let assignedAfterAccess: U;
if (assignedAfterAccess.kind === (assignedAfterAccess = replacement, "a")) {
    // @ts-expect-error The assignment occurs after the discriminant access.
    assignedAfterAccess.a;
}

declare let assignedInIIFE: U;
if (assignedInIIFE.kind === (() => {
    assignedInIIFE = replacement;
    return "a" as const;
})()) {
    // @ts-expect-error The invoked function assigns after the discriminant access.
    assignedInIIFE.a;
}

declare let assignedBeforeAccess: U;
if ((assignedBeforeAccess = replacement, "a") === assignedBeforeAccess.kind) {
    const narrowed: { kind: "a"; a: number } = assignedBeforeAccess;
}

declare let functionNotInvoked: U;
declare let functionHolder: (() => U) | undefined;
if (functionNotInvoked.kind === (functionHolder = () => functionNotInvoked = replacement, "a")) {
    const narrowed: { kind: "a"; a: number } = functionNotInvoked;
}

declare let unrelatedAssignment: U;
declare let other: U;
if (unrelatedAssignment.kind === (other = replacement, "a")) {
    const narrowed: { kind: "a"; a: number } = unrelatedAssignment;
}

declare let directEquality: "a" | "b";
declare const directReplacement: "a" | "b";
if (directEquality === (directEquality = directReplacement, "a")) {
    // @ts-expect-error The assignment occurs after the reference is evaluated.
    const narrowed: "a" = directEquality;
}

declare let optionalChain: { property: number } | undefined;
declare const optionalReplacement: { property: number } | undefined;
if (optionalChain?.property !== (optionalChain = optionalReplacement, undefined)) {
    // @ts-expect-error The assignment occurs after the optional chain is evaluated.
    optionalChain.property;
}

class A {
    a = 0;
}
class B {
    b = "";
}

declare let constructorValue: A | B;
declare const constructorReplacement: A | B;
if (constructorValue.constructor === (constructorValue = constructorReplacement, A)) {
    // @ts-expect-error The assignment occurs after the constructor access is evaluated.
    constructorValue.a;
}

declare let instanceValue: A | B;
declare const instanceReplacement: A | B;
if (instanceValue instanceof (instanceValue = instanceReplacement, A)) {
    // @ts-expect-error The assignment occurs after the left operand is evaluated.
    instanceValue.a;
}

declare let looseEquality: U;
declare const looseReplacement: U;
if (looseEquality.kind == (looseEquality = looseReplacement, "a")) {
    // @ts-expect-error The assignment occurs after the discriminant access.
    looseEquality.a;
}

declare let switchDiscriminant: U;
declare const switchReplacement: U;
switch (switchDiscriminant.kind) {
    case (switchDiscriminant = switchReplacement, "a"):
        // @ts-expect-error The assignment occurs after the switch expression is evaluated.
        switchDiscriminant.a;
}

declare let switchReference: "a" | "b";
declare const switchReferenceReplacement: "a" | "b";
switch (switchReference) {
    case (switchReference = switchReferenceReplacement, "a"):
        // @ts-expect-error The assignment occurs after the switch expression is evaluated.
        const narrowed: "a" = switchReference;
}

declare let assignmentInLaterCase: U;
switch (assignmentInLaterCase.kind) {
    case "a":
        const narrowed: { kind: "a"; a: number } = assignmentInLaterCase;
        break;
    case (assignmentInLaterCase = switchReplacement, "b"):
        break;
}

declare let assignmentInSwitchTrueCase: U;
switch (true) {
    case (assignmentInSwitchTrueCase = switchReplacement, assignmentInSwitchTrueCase.kind === "a"):
        const narrowed: { kind: "a"; a: number } = assignmentInSwitchTrueCase;
}
