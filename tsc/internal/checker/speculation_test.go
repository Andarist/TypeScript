package checker

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/diagnostics"
	"gotest.tools/v3/assert"
)

func TestSpeculationNestedRollback(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	node := &ast.Node{}
	original := &Type{}
	outer := &Type{}
	inner := &Type{}
	c.typeNodeLinks.Get(node).setResolvedType(original)
	relation := &Relation{speculatableMap: speculatableMap[CacheHashKey, RelationComparisonResult]{host: &c.speculationHost}}
	key := CacheHashKey{}
	relation.set(key, RelationComparisonResultSucceeded)
	diagnostic := ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call)
	success := &Signature{}
	c.speculate(func() *Signature {
		c.typeNodeLinks.Get(node).setResolvedType(outer)
		c.speculate(func() *Signature {
			c.typeNodeLinks.Get(node).setResolvedType(inner)
			relation.set(key, RelationComparisonResultFailed)
			c.addDiagnostic(diagnostic)
			return success
		})
		assert.Equal(t, c.typeNodeLinks.Get(node).getResolvedType(), inner)
		assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 1)
		return nil
	})
	assert.Equal(t, c.typeNodeLinks.Get(node).getResolvedType(), original)
	assert.Equal(t, relation.get(key), RelationComparisonResultSucceeded)
	assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 0)
	// The discarded diagnostic must not remain in the deduplication index.
	c.addDiagnostic(diagnostic)
	assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 1)
}

func TestSpeculationInnerFailureOuterSuccess(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	node := &ast.Node{}
	outer := &Type{}
	inner := &Type{}
	success := &Signature{}
	diagnostic := ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call)
	c.speculate(func() *Signature {
		c.typeNodeLinks.Get(node).setResolvedType(outer)
		c.addDiagnostic(diagnostic)
		c.speculate(func() *Signature {
			c.typeNodeLinks.Get(node).setResolvedType(inner)
			c.nodeLinks.Get(node).setFlags(NodeCheckFlagsContextChecked)
			return nil
		})
		assert.Equal(t, c.typeNodeLinks.Get(node).getResolvedType(), outer)
		assert.Equal(t, c.nodeLinks.Get(node).getFlags(), NodeCheckFlagsNone)
		return success
	})
	assert.Equal(t, c.typeNodeLinks.Get(node).getResolvedType(), outer)
	assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 1)
}

func TestSpeculationPreservesSyntheticSymbols(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	var symbol *ast.Symbol
	original := &Type{}
	c.speculate(func() *Signature {
		symbol = c.newSymbol(ast.SymbolFlagsFunctionScopedVariable, "value")
		c.valueSymbolLinks.Get(symbol).setResolvedType(original)
		return nil
	})
	assert.Equal(t, c.valueSymbolLinks.Get(symbol).getResolvedType(), original)
	updated := &Type{}
	c.speculate(func() *Signature {
		c.valueSymbolLinks.Get(symbol).setResolvedType(updated)
		return nil
	})
	assert.Equal(t, c.valueSymbolLinks.Get(symbol).getResolvedType(), updated)
}

func TestSpeculationPreservesGlobalDiagnostics(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	diagnostic := ast.NewDiagnostic(nil, core.TextRange{}, diagnostics.Cannot_find_global_type_0, "Awaited")
	c.speculate(func() *Signature {
		c.addDiagnostic(diagnostic)
		return nil
	})
	assert.Equal(t, len(c.diagnostics.GetGlobalDiagnostics()), 1)
}

func TestSpeculationRewindsUnresolvedExistingSymbol(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	symbol := c.newSymbol(ast.SymbolFlagsFunctionScopedVariable, "value")
	c.speculate(func() *Signature {
		c.valueSymbolLinks.Get(symbol).setResolvedType(&Type{})
		return nil
	})
	assert.Assert(t, c.valueSymbolLinks.Get(symbol).getResolvedType() == nil)
}

func TestSpeculationRestoresRetainedLinks(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	node := &ast.Node{}
	links := c.typeNodeLinks.Get(node)
	original, outer, inner := &Type{}, &Type{}, &Type{}
	links.setResolvedType(original)
	c.speculate(func() *Signature {
		links.setResolvedType(outer)
		c.speculate(func() *Signature {
			links.setResolvedType(inner)
			return nil
		})
		assert.Equal(t, links.getResolvedType(), outer)
		return nil
	})
	assert.Equal(t, links.getResolvedType(), original)
	assert.Equal(t, c.typeNodeLinks.Get(node), links)
}

func TestSpeculationRestoresRetainedPagedLinks(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	node := &ast.Node{}
	nodeLinks := c.symbolNodeLinks.Get(node)
	symbol := c.newSymbol(ast.SymbolFlagsFunctionScopedVariable, "value")
	valueLinks := c.valueSymbolLinks.Get(symbol)
	original, updated := &Type{}, &Type{}
	valueLinks.setResolvedType(original)
	c.speculate(func() *Signature {
		nodeLinks.setResolvedSymbol(symbol)
		valueLinks.setResolvedType(updated)
		return nil
	})
	assert.Assert(t, nodeLinks.getResolvedSymbol() == nil)
	assert.Equal(t, valueLinks.getResolvedType(), original)
}

func TestSpeculatableCacheDiscardsLazily(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	links := c.typeNodeLinks.Get(&ast.Node{})
	original, rejected := &Type{}, &Type{}
	links.setResolvedType(original)
	c.speculate(func() *Signature { links.setResolvedType(rejected); return nil })
	assert.Equal(t, len(links.resolvedTypeCache.values), 2)
	assert.Equal(t, links.getResolvedType(), original)
	assert.Equal(t, len(links.resolvedTypeCache.values), 1)
	assert.Equal(t, c.speculationHost.currentSpeculativeEpoch, uint64(2))
}

func TestSpeculatableMapRestoresAndRemovesEntries(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	cache := speculatableMap[string, int]{host: &c.speculationHost}
	cache.set("existing", 1)
	c.speculate(func() *Signature {
		cache.set("existing", 2)
		cache.set("new", 3)
		return nil
	})
	assert.Equal(t, cache.size(), 2)
	assert.Equal(t, cache.get("existing"), 1)
	assert.Equal(t, cache.get("new"), 0)
	assert.Equal(t, cache.size(), 1)
	c.speculate(func() *Signature { cache.set("existing", 4); return &Signature{} })
	assert.Equal(t, cache.get("existing"), 4)
}

func TestSpeculationRestoresRegisteredCollections(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	key := FlowLoopKey{}
	original := &Type{}
	c.flowLoopCache = map[FlowLoopKey]*Type{key: original}
	c.deferredDiagnosticCallbacks = []func(){func() {}}
	c.speculate(func() *Signature {
		c.flowLoopCache[key] = &Type{}
		c.deferredDiagnosticCallbacks = append(c.deferredDiagnosticCallbacks, func() {})
		c.addSuggestionDiagnostic(ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call))
		return nil
	})
	assert.Equal(t, c.flowLoopCache[key], original)
	assert.Equal(t, len(c.deferredDiagnosticCallbacks), 1)
	assert.Equal(t, len(c.suggestionDiagnostics.GetDiagnostics()), 0)
}
