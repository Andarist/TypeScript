package checker

import (
	"testing"

	"github.com/google/go-cmp/cmp"
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

func TestSpeculatableCacheRewindsRejectedValues(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	links := c.typeNodeLinks.Get(&ast.Node{})
	original, rejected := &Type{}, &Type{}
	links.setResolvedType(original)
	c.speculate(func() *Signature { links.setResolvedType(rejected); return nil })
	assert.Equal(t, links.getResolvedType(), original)
	assert.Equal(t, c.speculationHost.currentSpeculativeEpoch, uint64(2))
}

func TestSpeculatableMapRestoresAndRemovesEntries(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	cache := speculatableMap[string, RelationComparisonResult]{host: &c.speculationHost}
	cache.set("existing", 1)
	c.speculate(func() *Signature {
		cache.set("existing", 2)
		cache.set("new", 3)
		return nil
	})
	assert.Equal(t, cache.size(), 2)
	assert.Equal(t, cache.get("existing"), RelationComparisonResult(1))
	assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 1)
	c.speculate(func() *Signature { cache.set("existing", 4); return &Signature{} })
	assert.Equal(t, cache.get("existing"), RelationComparisonResult(4))
}

func TestSpeculationRestoresRegisteredCollections(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	key := FlowLoopKey{}
	original := &Type{}
	c.flowLoopCache = speculatableMap[FlowLoopKey, *Type]{host: &c.speculationHost}
	c.flowLoopCache.set(key, original)
	c.deferredDiagnosticCallbacks = []func(){func() {}}
	c.speculate(func() *Signature {
		c.flowLoopCache.set(key, &Type{})
		c.deferredDiagnosticCallbacks = append(c.deferredDiagnosticCallbacks, func() {})
		c.addSuggestionDiagnostic(ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call))
		return nil
	})
	assert.Equal(t, c.flowLoopCache.get(key), original)
	assert.Equal(t, len(c.deferredDiagnosticCallbacks), 1)
	assert.Equal(t, len(c.suggestionDiagnostics.GetDiagnostics()), 0)
}

func TestSpeculationPanicRevertsState(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	links := c.typeNodeLinks.Get(&ast.Node{})
	original := &Type{}
	links.setResolvedType(original)
	diagnostic := ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call)
	func() {
		defer func() { assert.Equal(t, recover(), "stop") }()
		c.speculate(func() *Signature {
			links.setResolvedType(&Type{})
			c.addDiagnostic(diagnostic)
			panic("stop")
		})
	}()
	assert.Equal(t, links.getResolvedType(), original)
	assert.Equal(t, c.speculationHost.activeFrame, uint64(0))
	assert.Equal(t, c.speculationHost.checkpointCaches(), cacheCheckpoint{})
	assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 0)
	// A successful subsequent attempt proves both diagnostic checkpoints closed.
	c.speculate(func() *Signature { c.addDiagnostic(diagnostic); return &Signature{} })
	assert.Equal(t, len(c.diagnostics.GetDiagnostics()), 1)
}

// An unread discarded write can survive if its owning symbol subsequently escapes
// an enclosing discarded transaction. Keep this upstream lazy-cache behavior.
func TestSpeculationEscapedSymbolUnreadDiscardedWrites(t *testing.T) {
	t.Parallel()
	for _, readBeforeOuterFailure := range []bool{false, true} {
		c := &Checker{}
		c.initializeSpeculation()
		original, inner := &Type{}, &Type{}
		var symbol *ast.Symbol
		c.speculate(func() *Signature {
			symbol = c.newSymbol(ast.SymbolFlagsFunctionScopedVariable, "escape")
			links := c.valueSymbolLinks.Get(symbol)
			links.setResolvedType(original)
			c.speculate(func() *Signature { links.setResolvedType(inner); return nil })
			if readBeforeOuterFailure {
				assert.Equal(t, links.getResolvedType(), original)
			}
			return nil
		})
		want := inner
		if readBeforeOuterFailure {
			want = original
		}
		assert.Equal(t, c.valueSymbolLinks.Get(symbol).getResolvedType(), want)
	}
}

func TestSpeculationCacheUndoLifecycle(t *testing.T) {
	t.Parallel()
	testCacheUndoLifecycle(t, "types", &Type{}, &Type{}, &Type{})
	testCacheUndoLifecycle(t, "signatures", &Signature{}, &Signature{}, &Signature{})
	testCacheUndoLifecycle(t, "symbols", &ast.Symbol{}, &ast.Symbol{}, &ast.Symbol{})
	testCacheUndoLifecycle(t, "flags", NodeCheckFlags(1), NodeCheckFlags(2), NodeCheckFlags(3))
	testCacheUndoLifecycle(t, "bools", false, true, false)
	testCacheUndoLifecycle(t, "exhaustive", ExhaustiveState(0), ExhaustiveState(1), ExhaustiveState(2))
	testCacheUndoLifecycle(t, "typeSlices", []*Type{{}}, []*Type{{}, {}}, []*Type{})
	testCacheUndoLifecycle(t, "stringSlices", []string{"original"}, []string{"outer"}, []string{"inner"})
	testCacheUndoLifecycle(t, "relations", RelationComparisonResult(1), RelationComparisonResult(2), RelationComparisonResult(3))
}

func testCacheUndoLifecycle[V speculatableCacheValue](t *testing.T, name string, original, outer, inner V) {
	// Cache rollback must preserve object identity, not compare checker internals.
	identity := cmp.Options{
		cmp.Comparer(func(a, b *Type) bool { return a == b }),
		cmp.Comparer(func(a, b *Signature) bool { return a == b }),
		cmp.Comparer(func(a, b *ast.Symbol) bool { return a == b }),
	}
	t.Run(name, func(t *testing.T) {
		t.Parallel()
		c := &Checker{}
		c.initializeSpeculation()
		links := &speculatableLinks{host: &c.speculationHost}
		cache := &speculatableCache[V]{}
		cache.set(links, original)
		c.speculate(func() *Signature {
			cache.set(links, outer)
			c.speculate(func() *Signature {
				cache.set(links, inner)
				return &Signature{}
			})
			assert.DeepEqual(t, cache.get(links), inner, identity)
			// A parent write after an inner commit must not lose the parent's
			// original undo record, even when it writes the same cache again.
			cache.set(links, outer)
			c.speculate(func() *Signature {
				cache.set(links, inner)
				return nil
			})
			assert.DeepEqual(t, cache.get(links), outer, identity)
			return nil
		})
		assert.DeepEqual(t, cache.get(links), original, identity)
		assert.Equal(t, c.speculationHost.activeFrame, uint64(0))
		assert.Equal(t, c.speculationHost.checkpointCaches(), cacheCheckpoint{})
		c.speculate(func() *Signature {
			cache.set(links, outer)
			return &Signature{}
		})
		assert.DeepEqual(t, cache.get(links), outer, identity)
		assert.Equal(t, c.speculationHost.checkpointCaches(), cacheCheckpoint{})
		// Reusing the journals after a root commit must restore the committed value.
		c.speculate(func() *Signature { cache.set(links, inner); return nil })
		assert.DeepEqual(t, cache.get(links), outer, identity)
	})
}

func TestSpeculationMapRecreatesDiscardedEntry(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	cache := speculatableMap[string, RelationComparisonResult]{host: &c.speculationHost}
	c.speculate(func() *Signature {
		c.speculate(func() *Signature {
			cache.set("new", RelationComparisonResultSucceeded)
			return nil
		})
		// Reading removes the discarded entry. The parent's write creates a
		// different entry that must still be undone by the outer rollback.
		assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
		assert.Equal(t, cache.size(), 0)
		cache.set("new", RelationComparisonResultFailed)
		return nil
	})
	assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 0)
}
