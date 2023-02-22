// @strict: true
// @noEmit: true

type AcceptStr<T extends string> = T
type Other<T extends string> = T extends infer R ? AcceptStr<R> : never
