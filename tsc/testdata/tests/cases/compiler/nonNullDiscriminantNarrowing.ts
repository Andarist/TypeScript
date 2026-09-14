// @strict: true
// @noEmit: true

type Small = { type: "1" } | { type: "2" } | null | undefined;

declare let smallEqual: Small;

if (smallEqual!.type === "1") {
    const narrowed: { type: "1" } = smallEqual;
}

declare let smallEqualRight: Small;

if ("1" === smallEqualRight!.type) {
    const narrowed: { type: "1" } = smallEqualRight;
}

declare let smallNotEqual: Small;

if (smallNotEqual!.type !== "1") {
    const narrowed: { type: "2" } = smallNotEqual;
}

type Large =
    | { type: "1" }
    | { type: "2" }
    | { type: "3" }
    | { type: "4" }
    | { type: "5" }
    | { type: "6" }
    | { type: "7" }
    | { type: "8" }
    | { type: "9" }
    | { type: "10" }
    | null
    | undefined;

declare let largeEqual: Large;

if (largeEqual!.type === "1") {
    const narrowed: { type: "1" } = largeEqual;
}

declare let largeNotEqual: Large;

if (largeNotEqual!.type !== "1") {
    const narrowed: Exclude<Large, null | undefined | { type: "1" }> = largeNotEqual;
}

declare let optional: Small;

if (optional?.type === undefined) {
    const narrowed: null | undefined = optional;
}

declare function isNever<T>(value: T): [T] extends [never] ? true : false;
declare let optionalAfterNonNull: Small;

if (optionalAfterNonNull!?.type === undefined) {
    const narrowed: null | undefined = optionalAfterNonNull;
    const notNever: false = isNever(optionalAfterNonNull);
}

declare let optionalBangLeft: Small;

if (optionalBangLeft!?.type === "1") {
    const narrowed: { type: "1" } = optionalBangLeft;
}
else {
    const narrowed: Exclude<Small, { type: "1" }> = optionalBangLeft;
}

declare let optionalBangRight: Small;

if ("1" === optionalBangRight!?.type) {
    const narrowed: { type: "1" } = optionalBangRight;
}
else {
    const narrowed: Exclude<Small, { type: "1" }> = optionalBangRight;
}

declare let optionalBangSwitch: Small;

switch (optionalBangSwitch!?.type) {
    case "1":
        const one: { type: "1" } = optionalBangSwitch;
        break;
    default:
        const rest: Exclude<Small, { type: "1" }> = optionalBangSwitch;
}

type Bare = 0 | 1 | null | undefined;

declare let bareTruthy: Bare;
if (bareTruthy!) {
    const narrowed: 1 = bareTruthy;
}
else {
    const narrowed: 0 | null | undefined = bareTruthy;
}

declare let bareNegated: Bare;
if (!bareNegated!) {
    const narrowed: 0 | null | undefined = bareNegated;
}
else {
    const narrowed: 1 = bareNegated;
}

declare let bareEqual: Bare;
if (bareEqual! === 1) {
    const narrowed: 1 = bareEqual;
}
else {
    const narrowed: 0 | null | undefined = bareEqual;
}

type ByFlag = { flag: true } | { flag: false } | null | undefined;

declare let byFlag: ByFlag;
if (byFlag!.flag) {
    const narrowed: { flag: true } = byFlag;
}
else {
    const narrowed: { flag: false } = byFlag;
}

type ByValue = { value: "text" } | { value: 0 } | null | undefined;

declare let byTypeof: ByValue;
if (typeof byTypeof!.value === "string") {
    const narrowed: { value: "text" } = byTypeof;
}
else {
    const narrowed: { value: 0 } = byTypeof;
}

function switchSmall(value: Small) {
    switch (value!.type) {
        case "1":
            const one: { type: "1" } = value;
            break;
        case "2":
            const two: { type: "2" } = value;
            break;
    }
}

function switchLarge(value: Large) {
    switch (value!.type) {
        case "1":
            const one: { type: "1" } = value;
            break;
        default:
            const rest: Exclude<Large, null | undefined | { type: "1" }> = value;
    }
}

type ByOptional = { value: string } | { value: undefined } | null | undefined;

declare function useMissing(value: { value: undefined }): string;
declare let byOptional: ByOptional;
const coalesced = byOptional!.value ?? useMissing(byOptional);

type ByPresence = { present: number } | { absent: number } | null | undefined;

declare let byPresence: ByPresence;
if ("present" in byPresence!) {
    const narrowed: { present: number } = byPresence;
}
else {
    const narrowed: { absent: number } = byPresence;
}

type Container = { child: { present: number } | { absent: number } } | null | undefined;

declare let container: Container;
if ("present" in container?.child!) {
    const defined: NonNullable<Container> = container;
}
else {
    const defined: NonNullable<Container> = container;
}

class A { a = 0; }
class B { b = 0; }

declare let constructorLeft: A | B | null | undefined;
if (constructorLeft!.constructor === A) {
    const narrowed: A = constructorLeft;
}
else {
    const narrowed: A | B = constructorLeft;
}

declare let constructorRight: A | B | null | undefined;
if (A === constructorRight!.constructor) {
    const narrowed: A = constructorRight;
}
else {
    const narrowed: A | B = constructorRight;
}

declare let byInstanceof: A | B | null | undefined;
if (byInstanceof! instanceof A) {
    const narrowed: A = byInstanceof;
}
else {
    const narrowed: B | null | undefined = byInstanceof;
}
