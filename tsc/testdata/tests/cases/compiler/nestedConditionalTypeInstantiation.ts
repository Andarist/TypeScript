// @strict: true
// @noEmit: true
// @noTypesAndSymbols: true

type SameRootExclude<T, U> = T extends U ? never : T;

type DeeplyNestedExclude<T> = SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<SameRootExclude<T, 0>, 1>, 2>, 3>, 4>, 5>, 6>, 7>, 8>, 9>, 10>, 11>, 12>, 13>, 14>, 15>, 16>, 17>, 18>, 19>, 20>, 21>, 22>, 23>, 24>, 25>, 26>, 27>, 28>, 29>, 30>, 31>, 32>, 33>, 34>, 35>, 36>, 37>, 38>, 39>, 40>, 41>, 42>, 43>, 44>, 45>, 46>, 47>, 48>, 49>, 50>, 51>, 52>, 53>, 54>, 55>, 56>, 57>, 58>, 59>, 60>, 61>, 62>, 63>, 64>, 65>, 66>, 67>, 68>, 69>, 70>, 71>, 72>, 73>, 74>, 75>, 76>, 77>, 78>, 79>, 80>, 81>, 82>, 83>, 84>, 85>, 86>, 87>, 88>, 89>, 90>, 91>, 92>, 93>, 94>, 95>, 96>, 97>, 98>, 99>, 100>, 101>, 102>, 103>, 104>, 105>, 106>, 107>, 108>, 109>, 110>, 111>, 112>, 113>, 114>, 115>, 116>, 117>, 118>, 119>;

type DeepExcludeResult = DeeplyNestedExclude<999>;
const deepExcludeResult: DeepExcludeResult = 999;

type AssertNever<T extends never> = T;
type InnerExcluded = AssertNever<DeeplyNestedExclude<0>>;
type OuterExcluded = AssertNever<DeeplyNestedExclude<119>>;

type Source = { kind: "a" | "b"; value: number };
type A = { kind: "a"; value: number };
type B = { kind: "b"; value: number };

type SequentialResult = SameRootExclude<SameRootExclude<Source, B>, A>;
declare const source: Source;
const sequentialResult: SequentialResult = source;

type ToString<T> = T extends number ? string : T;
type ToBoolean<T> = T extends string ? boolean : T;

type DeeplyNestedAlternating<T> = ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<ToBoolean<ToString<T>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>;

type AlternatingResult = DeeplyNestedAlternating<42>;
const alternatingResult: AlternatingResult = true;

type Unbox<T> = T extends [infer U] ? U : T;
type DeeplyNestedUnbox<T> = Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<Unbox<T>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>;
type DeepUnboxResult = DeeplyNestedUnbox<[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[42]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]>;
const deepUnboxResult: DeepUnboxResult = 42;
