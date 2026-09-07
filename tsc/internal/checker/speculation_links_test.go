package checker

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
)

func TestValueSymbolLinksIdentity(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	symbol := &ast.Symbol{}
	if c.valueSymbolLinks.TryGet(symbol) != nil {
		t.Fatal("TryGet created a link")
	}
	links := c.valueSymbolLinks.Get(symbol)
	for range 3 {
		if c.valueSymbolLinks.Get(symbol) != links || c.valueSymbolLinks.TryGet(symbol) != links {
			t.Fatal("link identity changed")
		}
	}
	if !c.valueSymbolLinks.Has(symbol) {
		t.Fatal("Has does not see the created link")
	}
}
