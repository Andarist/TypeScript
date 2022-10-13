// @strict: true
// @noEmit: true

export interface Foo<T> {}
export class Foo<T> {
  public bar(): T extends string ? string | number : number {
    return 1;
  }
}
