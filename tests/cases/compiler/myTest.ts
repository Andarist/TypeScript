// @strict: true
// @noEmit: true


type Split<xs> = xs extends [infer first, ...infer rest] ? [first, rest] : never


type X = Split<unknown[] & [string, number]>