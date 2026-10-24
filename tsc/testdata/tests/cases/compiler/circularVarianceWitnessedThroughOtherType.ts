// @strict: true
// @noEmit: true

interface Method<T, K extends keyof T, S> {
    (): Builder<T, S | K>
    readonly selected: S
}
type Builder<T, S = never> = { [K in keyof T]-?: Method<T, K, S> }

declare let x: Builder<{ a: string }, 'a'>
declare let y: Builder<{ a: string }, 'b'>
y = x // error

declare let m1: Method<{ a: string }, 'a', 'a'>
declare let m2: Method<{ a: string }, 'a', 'b'>
m2 = m1 // error
