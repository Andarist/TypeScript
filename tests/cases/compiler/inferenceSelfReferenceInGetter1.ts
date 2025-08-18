// @strict: true
// @noEmit: true

type $InferObjectOutput<T extends Record<string, { output: unknown }>> = {
  [k in keyof T as T[k] extends unknown ? never : k]: T[k]["output"];
} & {
  [k in keyof T as T[k] extends unknown ? k : never]?: T[k]["output"];
};

declare function object<T extends Record<string, any>>(
  shape: T,
): {
  output: $InferObjectOutput<T>;
};

declare function array<T extends { output: unknown }>(
  element: T,
): {
  output: Array<T["output"]>;
  default: (def: Array<T["output"]>) => "def";
};

const fooSchema1 = object({
  get children() {
    return array(fooSchema1).default([]);
  },
});

declare function array2<T extends { output: unknown }>(
  element: T,
): {
  output: Array<T["output"]>;
  default: (def: Array<T["output"]>) => ReturnType<typeof array2<T>>;
};

const fooSchema2 = object({
  get children() {
    return array2(fooSchema2).default([]);
  },
});

fooSchema2.output.children?.[0].children?.[0].children?.[0].children;

declare function array3<T extends { output: unknown }>(
  element: T,
): {
  output: ReadonlyArray<T["output"]>;
  default: (def: ReadonlyArray<T["output"]>) => "def";
};

const fooSchema3 = object({
  get children() {
    return array3(fooSchema3).default([]);
  },
});

declare function array4<T extends { output: unknown }>(
  element: T,
): {
  output: ReadonlyArray<T["output"]>;
  default: (def: ReadonlyArray<T["output"]>) => ReturnType<typeof array4<T>>;
};

const fooSchema4 = object({
  get children() {
    return array4(fooSchema4).default([]);
  },
});

fooSchema4.output.children?.[0].children?.[0].children?.[0].children;

declare function object2<T extends Record<string, any>>(
  shape: T,
): {
  shape: T;
  output: $InferObjectOutput<T>;
  partialDefault: (
    def: Partial<$InferObjectOutput<T>>,
  ) => ReturnType<typeof object2<T>>;
};

const fooSchema5 = object2({
  get child() {
    return object2(fooSchema5.shape).partialDefault({});
  },
});

// fooSchema5.output.child

export {}