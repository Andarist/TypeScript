// @strict: true
// @target: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/62180
// https://github.com/microsoft/TypeScript/issues/62181

// Resolving the members of ZodObject<T> instantiates the base type ZodType<InferObjectType<T>>, which
// requires the type of the 'parent' accessor, whose body refers back to the type through 'Category'.
// This is a circularity in the type of 'parent' and must not produce ghost errors on the call to
// 'optional' based on the partially resolved members of ZodObject<T>.

interface ZodType<T> {
  optional: "true" | "false";
  output: T;
}

interface ZodString extends ZodType<string> {
  optional: "false";
}

type ZodShape = Record<string, any>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type InferObjectType<Shape extends ZodShape> = Prettify<
  {
    [k in keyof Shape as Shape[k] extends { optional: "true" }
      ? k
      : never]?: Shape[k]["output"];
  } & {
    [k in keyof Shape as Shape[k] extends { optional: "true" }
      ? never
      : k]: Shape[k]["output"];
  }
>;
interface ZodObject<T extends ZodShape> extends ZodType<InferObjectType<T>> {
  optional: "false";
}

interface ZodOptional<T extends ZodType<any>>
  extends ZodType<T["output"] | undefined> {
  optional: "true";
}

declare function object<T extends ZodShape>(shape: T): ZodObject<T>;
declare function string(): ZodString;
declare function optional<T extends ZodType<any>>(schema: T): ZodOptional<T>;

const Category = object({
  name: string(),
  get parent() {
    return optional(Category);
  },
});

export const output = Category.output;
