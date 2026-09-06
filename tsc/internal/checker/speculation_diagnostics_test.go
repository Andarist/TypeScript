package checker

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/diagnostics"
)

func TestPermanentDiagnosticJournalNestedOutcomes(t *testing.T) {
	for _, outerSuccess := range []bool{false, true} {
		for _, innerSuccess := range []bool{false, true} {
			c := &Checker{}
			c.initializeSpeculation()
			makeGlobal := func(name string) *ast.Diagnostic {
				return ast.NewDiagnostic(nil, core.TextRange{}, diagnostics.Cannot_find_global_type_0, name)
			}
			before, outer, inner := makeGlobal("before"), makeGlobal("outer"), makeGlobal("inner")
			file := &ast.SourceFile{}
			temporary := ast.NewDiagnostic(file, core.TextRange{}, diagnostics.Cannot_find_name_0, "temporary")
			permanentFile := ast.NewDiagnostic(file, core.TextRange{}, diagnostics.Cannot_find_name_0, "permanent")
			c.addDiagnostic(before)
			c.speculate(func() *Signature {
				c.addDiagnostic(outer)
				c.speculate(func() *Signature {
					c.addDiagnostic(inner)
					c.addPermanentDiagnostic(permanentFile)
					c.addDiagnostic(temporary)
					// Reading sorted diagnostics during an attempt must not affect rollback.
					c.diagnostics.GetDiagnostics()
					if innerSuccess {
						return &Signature{}
					}
					return nil
				})
				c.addDiagnostic(inner) // Re-adding the same object must remain deduplicated.
				if outerSuccess {
					return &Signature{}
				}
				return nil
			})
			want := 4
			if outerSuccess && innerSuccess {
				want++
			}
			if got := len(c.diagnostics.GetDiagnostics()); got != want {
				t.Fatalf("outer %v inner %v: got %d diagnostics want %d", outerSuccess, innerSuccess, got, want)
			}
			if len(c.permanentDiagnosticLog) != 0 {
				t.Fatal("root outcome retained log entries")
			}
			for _, d := range c.permanentDiagnosticLog[:cap(c.permanentDiagnosticLog)] {
				if d != nil {
					t.Fatal("journal retained a diagnostic reference")
				}
			}
			c.speculate(func() *Signature { c.addDiagnostic(makeGlobal("later")); return nil })
			if got := len(c.diagnostics.GetDiagnostics()); got != want+1 {
				t.Fatal("later rollback lost existing permanent diagnostics")
			}
		}
	}
}

func TestPermanentDiagnosticJournalPanic(t *testing.T) {
	c := &Checker{}
	c.initializeSpeculation()
	diagnostic := ast.NewDiagnostic(nil, core.TextRange{}, diagnostics.Cannot_find_global_type_0, "panic")
	func() {
		defer func() {
			if recover() == nil {
				t.Error("expected panic")
			}
		}()
		c.speculate(func() *Signature { c.addDiagnostic(diagnostic); panic("abort") })
	}()
	if len(c.diagnostics.GetGlobalDiagnostics()) != 1 || len(c.permanentDiagnosticLog) != 0 {
		t.Fatal("panic did not preserve the diagnostic and close the journal")
	}
}
