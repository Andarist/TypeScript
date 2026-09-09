// @strict: true
// @target: esnext
// @noEmit: true

// Same as circularAccessorInBaseTypeInstantiation4.ts, but the base type is an intersection produced by a mixin
// constructor, so the inherited members come from an intersection type rather than a type reference.

declare class ZodType<T> {
  optional: "true" | "false";
  output: T;
}

declare class ZodString extends ZodType<string> {
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
interface Extra { extra: string }
declare const MixedBase: new <U>() => ZodType<U> & Extra;
declare class ZodObject<T extends ZodShape> extends MixedBase<InferObjectType<T>> {
  optional: "false";
}

declare class ZodOptional<T extends ZodType<any>>
  extends ZodType<T["output"] | undefined> {
  optional: "true";
}

declare function object<T extends ZodShape>(shape: T): ZodObject<T>;
declare function string(): ZodString;
declare function optional<T extends ZodType<any>>(schema: T): ZodOptional<T>;
declare function optional<T extends ZodType<any>>(schema: T, flag: boolean): ZodOptional<T>;

const Category = object({
  name: string(),
  get parent() {
    return optional(Category);
  },
});

export const output = Category.output;
const nested: string = output.parent!.parent!.name;
const extra: string = Category.extra;
