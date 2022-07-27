// @noEmit: true
// @strict: true

const anyArray: any[] = []

const t1: [] = anyArray // any is not assignable to never
const t2: [string] = anyArray
const t3: [string, ...any[]] = anyArray
const t4: [...any[], string] = anyArray
