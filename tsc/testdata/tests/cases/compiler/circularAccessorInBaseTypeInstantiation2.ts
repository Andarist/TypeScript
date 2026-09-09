// @strict: true
// @target: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/62181

// Same as circularAccessorInBaseTypeInstantiation1.ts, except that 'output' is a declared member whose type is
// instantiated lazily, so the type of the 'parent' accessor isn't needed to resolve the members of ZodObject<T>.

interface ZodType {
  optional: "true" | "false";
  output: any;
}

interface ZodString extends ZodType {
  optional: "false";
  output: string;
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
interface ZodObject<T extends ZodShape> extends ZodType {
  optional: "false";
  output: InferObjectType<T>;
}

interface ZodOptional<T extends ZodType> extends ZodType {
  optional: "true";
  output: T["output"] | undefined;
}

declare function object<T extends ZodShape>(shape: T): ZodObject<T>;
declare function string(): ZodString;
declare function optional<T extends ZodType>(schema: T): ZodOptional<T>;

const Category = object({
  name: string(),
  get parent() {
    return optional(Category);
  },
});

export const output = Category.output;
