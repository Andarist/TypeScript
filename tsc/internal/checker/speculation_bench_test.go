package checker

import (
	"fmt"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/diagnostics"
)

func BenchmarkSpeculationCheckpoint(b *testing.B) {
	for _, count := range []int{0, 100, 1000} {
		b.Run(fmt.Sprint(count), func(b *testing.B) {
			c := &Checker{}
			c.initializeSpeculation()
			for i := 0; i < count; i++ {
				c.addDiagnostic(ast.NewDiagnostic(&ast.SourceFile{}, core.NewTextRange(i, i+1), diagnostics.Cannot_find_name_0, "missing"))
			}
			success := &Signature{}
			b.ReportAllocs()
			for b.Loop() {
				c.speculate(func() *Signature { return success })
			}
		})
	}
}
