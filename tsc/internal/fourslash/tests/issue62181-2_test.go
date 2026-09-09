package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestIssue62181_2(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `// @strict: true
// @target: esnext
// @lib: esnext
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
  get parent/*1*/() {
    return optional(Category);
  },
});

export const output = Category.output`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "1", `(accessor) parent: ZodOptional<ZodObject<{
    name: ZodString;
    readonly parent: ZodOptional<ZodObject<...>>;
}>>`, "")
	f.VerifyNonSuggestionDiagnostics(t, nil)
}
