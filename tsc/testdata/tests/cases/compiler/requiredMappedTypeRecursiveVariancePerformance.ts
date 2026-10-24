// @strict: true
// @noEmit: true

type D = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type Entity = Record<`f${'0' | '1' | '2' | '3' | '4'}${D}${D}`, string> // 500 properties

interface Method<T, K extends keyof T, S> {
    (): Builder<T, S | K>
}
type Builder<T, S = never> = { [K in keyof T]-?: Method<T, K, S> }

declare const builder: Builder<Entity>
export const widened: Builder<Entity & object> = builder
