// @strict: true
// @noEmit: true

interface A {
  a: string;
}
interface B {
  b: number;
}
interface C {
  c: boolean;
}

// Each nested form must be mutually assignable with its repacked form and with its expansion.

function extractNegatedOuter<T>(
  nested: Extract<Extract<T, A>, not B>,
  repacked: Extract<T, A & not B>,
  expanded: T & A & not B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function extractNegatedInner<T>(
  nested: Extract<Extract<T, not A>, B>,
  repacked: Extract<T, not A & B>,
  expanded: T & not A & B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function excludeNegatedOuter<T>(
  nested: Exclude<Exclude<T, A>, not B>,
  repacked: Exclude<T, A | not B>,
  expanded: T & not A & B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function excludeNegatedInner<T>(
  nested: Exclude<Exclude<T, not A>, B>,
  repacked: Exclude<T, not A | B>,
  expanded: T & A & not B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function extractIntersectionOuter<T>(
  nested: Extract<Extract<T, A>, B & C>,
  repacked: Extract<T, A & B & C>,
  expanded: T & A & B & C,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function extractIntersectionInner<T>(
  nested: Extract<Extract<T, A & C>, B>,
  repacked: Extract<T, A & C & B>,
  expanded: T & A & C & B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function excludeIntersectionOuter<T>(
  nested: Exclude<Exclude<T, A>, B & C>,
  repacked: Exclude<T, A | (B & C)>,
  expanded: T & not A & not (B & C),
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

function excludeUnionInner<T>(
  nested: Exclude<Exclude<T, A | C>, B>,
  repacked: Exclude<T, A | C | B>,
  expanded: T & not A & not C & not B,
) {
  nested = repacked;
  repacked = nested;
  nested = expanded;
  expanded = nested;
}

// Repacking must preserve member order, which determines overload order. Both nested forms are
// 'F1 & F2 & F3', so the call resolves to the signature of 'F1'.
type F1 = (x: 1) => "one";
type F2 = (x: 2) => "two";
type F3 = (x: 3) => "three";

declare const anyArgument: any;
declare const extractFirstPosition: Extract<Extract<F1, F2>, F3>;
declare const extractSecondPosition: Extract<F1, Extract<F2, F3>>;
const extractFirstPositionResult: "one" = extractFirstPosition(anyArgument);
const extractSecondPositionResult: "one" = extractSecondPosition(anyArgument);
