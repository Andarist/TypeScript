package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/lsp/lsproto"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestIssue62181(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `// @strict: true
// @target: esnext
// @lib: esnext
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
  get [|parent|]/*1*/() {
    return optional(Category);
  },
});

export const output = Category.output;`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "1", "(accessor) parent: any", "")
	f.VerifyNonSuggestionDiagnostics(t, []*lsproto.Diagnostic{
		{
			Message: lsproto.StringOrMarkupContent{String: new("'parent' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.")},
			Code:    &lsproto.IntegerOrString{Integer: new(int32(7023))},
		},
	})
}
