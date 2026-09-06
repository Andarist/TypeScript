package checker

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
)

func TestMaskedObjectFacts(t *testing.T) {
	for _, strict := range []bool{false, true} {
		c := &Checker{strictNullChecks: strict}
		for _, shape := range []string{"empty", "object", "function"} {
			typ := c.newObjectType(ObjectFlagsAnonymous, nil)
			typ.objectFlags |= ObjectFlagsMembersResolved
			members := typ.AsStructuredType()
			switch shape {
			case "object":
				members.properties = []*ast.Symbol{{Name: "value", Flags: ast.SymbolFlagsProperty}}
			case "function":
				members.signatures = []*Signature{{}}
				members.callSignatureCount = 1
			}
			// The full query resolves which object classification applies. Every
			// projection, including mixed masks, must agree with that result.
			full := c.getTypeFacts(typ, TypeFactsAll)
			check := func(mask TypeFacts) {
				t.Helper()
				if got := c.getTypeFacts(typ, mask); got != full&mask {
					t.Fatalf("strict=%v shape=%s mask=%x: got %x, want %x", strict, shape, mask, got, full&mask)
				}
			}
			check(TypeFactsNone)
			for i := range 32 {
				bit := TypeFacts(1) << i
				check(bit)
				check(TypeFactsAll &^ bit)
				for j := range 32 {
					check(bit | TypeFacts(1)<<j)
				}
			}
		}
	}
}

func TestCommonObjectFactsDoNotResolveMembers(t *testing.T) {
	for _, strict := range []bool{false, true} {
		c := &Checker{strictNullChecks: strict}
		typ := c.newObjectType(ObjectFlagsAnonymous, nil)
		if got := c.getTypeFacts(typ, TypeFactsNEUndefinedOrNull); got != TypeFactsNEUndefinedOrNull {
			t.Fatalf("strict=%v: got %x", strict, got)
		}
		if typ.objectFlags&ObjectFlagsMembersResolved != 0 {
			t.Fatal("resolved members for a fact shared by every object classification")
		}
	}
}
