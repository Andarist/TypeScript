// @strict: true
// @noEmit: true

{
  type Inner<A extends any[], A2 extends [...A, boolean]> = A2;
  type Wrapper<A extends any[]> = Inner<
    A,
    [...A, boolean, boolean, boolean, boolean]
  >;
}

{
  type Inner<A extends any[], A2 extends [...A, boolean]> = A2;

  type Wrapper<A extends any[]> = Inner<A, [...A, boolean, boolean, boolean]>;
}

{
  type Inner<A extends any[], A2 extends [...A, boolean]> = A2;

  type Wrapper<A extends any[], B extends any[]> = Inner<
    A,
    [...A, boolean, ...B, boolean, boolean, boolean]
  >;
}

{
  type Inner<
    A extends unknown[],
    B extends unknown[],
    C extends [...A, boolean, ...B, boolean],
  > = C;

  type Wrapper<A extends unknown[], B extends unknown[]> = Inner<
    A,
    B,
    [...A, boolean, ...B, boolean, boolean]
  >;
}

{
  type Inner<
    A extends unknown[],
    B extends unknown[],
    C extends [...A, boolean, ...B, boolean],
  > = C;

  type Wrapper<A extends unknown[], B extends unknown[]> = Inner<
    A,
    B,
    [...A, boolean, ...B, boolean] // ok
  >;
}

{
  type Inner<
    A extends unknown[],
    B extends unknown[],
    C extends [...A, boolean, ...B, boolean],
  > = C;

  type Wrapper<A extends unknown[], B extends unknown[]> = Inner<
    A,
    B,
    [...A, boolean, boolean, ...B, boolean]
  >;
}

{
  type Inner<
    A extends unknown[],
    B extends unknown[],
    C extends [...A, boolean, boolean, ...B, boolean],
  > = C;

  type Wrapper<A extends unknown[], B extends unknown[]> = Inner<
    A,
    B,
    [...A, boolean, ...B, boolean]
  >;
}

// === Additional edge case tests ===

// Test: Source variadic should not map to target's optional end element
{
  type Inner<T extends unknown[], U extends [...T, boolean?]> = U;

  // Should be OK - variadic matches variadic, optional is not required
  type Test1<T extends unknown[]> = Inner<T, [...T]>;

  // Should be OK - variadic matches variadic, boolean matches optional
  type Test2<T extends unknown[]> = Inner<T, [...T, boolean]>;
}

// Test: Fixed element at start of target
{
  type Inner<T extends unknown[], U extends [boolean, ...T]> = U;

  // Should error - missing boolean at start
  type Test1<T extends unknown[]> = Inner<T, [...T]>;

  // Should be OK
  type Test2<T extends unknown[]> = Inner<T, [boolean, ...T]>;
}

// Test: Multiple variadics with no fixed elements
{
  type Inner<A extends unknown[], B extends unknown[], C extends [...A, ...B]> = C;

  // Should be OK - 1:1 mapping
  type Test1<A extends unknown[], B extends unknown[]> = Inner<A, B, [...A, ...B]>;

  // Should error - missing second variadic
  type Test2<A extends unknown[]> = Inner<A, A, [...A]>;

  // Should error - extra variadic
  type Test3<A extends unknown[], B extends unknown[], C extends unknown[]> = Inner<A, B, [...A, ...B, ...C]>;
}

// Test: Three variadics
{
  type Inner<A extends unknown[], B extends unknown[], C extends unknown[], D extends [...A, ...B, ...C]> = D;

  // Should be OK
  type Test1<A extends unknown[], B extends unknown[], C extends unknown[]> = Inner<A, B, C, [...A, ...B, ...C]>;

  // Should error - wrong order shouldn't matter for this test, but extra element does
  type Test2<A extends unknown[], B extends unknown[], C extends unknown[]> = Inner<A, B, C, [...A, ...B, boolean, ...C]>;
}

// Test: Fixed elements between variadics
{
  type Inner<A extends unknown[], B extends unknown[], C extends [...A, boolean, ...B]> = C;

  // Should be OK
  type Test1<A extends unknown[], B extends unknown[]> = Inner<A, B, [...A, boolean, ...B]>;

  // Should error - missing boolean between variadics
  type Test2<A extends unknown[], B extends unknown[]> = Inner<A, B, [...A, ...B]>;

  // Should error - extra boolean between variadics
  type Test3<A extends unknown[], B extends unknown[]> = Inner<A, B, [...A, boolean, boolean, ...B]>;
}

// Test: Fixed at both ends
{
  type Inner<T extends unknown[], U extends [boolean, ...T, boolean]> = U;

  // Should be OK
  type Test1<T extends unknown[]> = Inner<T, [boolean, ...T, boolean]>;

  // Should error - missing end boolean
  type Test2<T extends unknown[]> = Inner<T, [boolean, ...T]>;

  // Should error - missing start boolean
  type Test3<T extends unknown[]> = Inner<T, [...T, boolean]>;

  // Should error - extra element in middle
  type Test4<T extends unknown[]> = Inner<T, [boolean, ...T, boolean, boolean]>;
}

// Test: Multiple fixed at end
{
  type Inner<T extends unknown[], U extends [...T, boolean, boolean, boolean]> = U;

  // Should be OK
  type Test1<T extends unknown[]> = Inner<T, [...T, boolean, boolean, boolean]>;

  // Should error - too few end elements
  type Test2<T extends unknown[]> = Inner<T, [...T, boolean, boolean]>;

  // Should error - too many end elements
  type Test3<T extends unknown[]> = Inner<T, [...T, boolean, boolean, boolean, boolean]>;
}

// Test: Rest element vs Variadic
{
  type Inner<T extends unknown[], U extends [...T, ...boolean[]]> = U;

  // Should be OK - variadic then rest
  type Test1<T extends unknown[]> = Inner<T, [...T, ...boolean[]]>;

  // Should be OK - variadic then fixed booleans (compatible with rest)
  type Test2<T extends unknown[]> = Inner<T, [...T, boolean, boolean]>;
}

// Test: Optional elements
{
  type Inner<T extends unknown[], U extends [...T, boolean?]> = U;

  // Should be OK - with optional
  type Test1<T extends unknown[]> = Inner<T, [...T, boolean?]>;

  // Should be OK - optional satisfied with required
  type Test2<T extends unknown[]> = Inner<T, [...T, boolean]>;

  // Should be OK - optional can be omitted
  type Test3<T extends unknown[]> = Inner<T, [...T]>;
}

// Test: Complex mix
{
  type Inner<
    A extends unknown[],
    B extends unknown[],
    C extends [boolean, ...A, string, ...B, number?]
  > = C;

  // Should be OK
  type Test1<A extends unknown[], B extends unknown[]> = Inner<A, B, [boolean, ...A, string, ...B, number?]>;

  // Should be OK - optional omitted
  type Test2<A extends unknown[], B extends unknown[]> = Inner<A, B, [boolean, ...A, string, ...B]>;

  // Should error - missing string between variadics
  type Test3<A extends unknown[], B extends unknown[]> = Inner<A, B, [boolean, ...A, ...B, number?]>;
}
