// @strict: true
// @noEmit: true

declare function array<T extends { output: unknown }>(
  element: T,
): {
  output: ReadonlyArray<T["output"]>;
  default: (def: ReadonlyArray<T["output"]>) => "def";
};

type $InferObjectOutput1<T extends Record<string, { output: unknown }>> = {
  [k in keyof T as T[k] extends unknown ? never : k]: T[k]["output"];
} & {
  [k in keyof T]?: T[k]["output"];
};

declare function object1<T extends Record<string, any>>(
  shape: T,
): {
  output: $InferObjectOutput1<T>;
};

const fooSchema1 = object1({
  get children() {
    return array(fooSchema1).default([]);
  },
});

type $InferObjectOutput2<T extends Record<string, { output: unknown }>> = {
  [k in keyof T]: T[k]["output"];
} & {
  [k in keyof T as T[k] extends unknown ? k : never]?: T[k]["output"];
};

declare function object2<T extends Record<string, any>>(
  shape: T,
): {
  output: $InferObjectOutput2<T>;
};

const fooSchema2 = object2({
  get children() {
    return array(fooSchema2).default([]);
  },
});

type $InferObjectOutput3<T extends Record<string, { output: unknown }>> = {
  [k in keyof T as T[k] extends unknown ? never : k]: T[k]["output"];
} & {
  [k in keyof T as T[k] extends unknown ? k : never]?: T[k]["output"];
};

declare function object3<T extends Record<string, any>>(
  shape: T,
): {
  output: $InferObjectOutput3<T>;
};

const fooSchema3 = object3({
  get children() {
    return array(fooSchema3).default([]);
  },
});
