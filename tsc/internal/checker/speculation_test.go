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
	c.typeNodeLinks.Get(node).setResolvedType(c, original)
	relation := &speculatableMap[CacheHashKey, RelationComparisonResult]{host: &c.speculationHost}
	key := CacheHashKey{}
	relation.set(key, RelationComparisonResultSucceeded)
	diagnostic := ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call)
	success := &Signature{}
	c.speculate(func() *Signature {
		c.typeNodeLinks.Get(node).setResolvedType(c, outer)
		c.speculate(func() *Signature {
			c.typeNodeLinks.Get(node).setResolvedType(c, inner)
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
		c.typeNodeLinks.Get(node).setResolvedType(c, outer)
		c.addDiagnostic(diagnostic)
		c.speculate(func() *Signature {
			c.typeNodeLinks.Get(node).setResolvedType(c, inner)
			c.nodeLinks.Get(node).setFlags(c, NodeCheckFlagsContextChecked)
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
	links.setResolvedType(c, original)
	c.speculate(func() *Signature {
		links.setResolvedType(c, outer)
		c.speculate(func() *Signature {
			links.setResolvedType(c, inner)
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
		nodeLinks.setResolvedSymbol(c, symbol)
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
	links.setResolvedType(c, original)
	c.speculate(func() *Signature { links.setResolvedType(c, rejected); return nil })
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
	assert.Equal(t, cache.size(), 1)
	assert.Equal(t, cache.get("existing"), RelationComparisonResult(1))
	assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
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
	links.setResolvedType(c, original)
	diagnostic := ast.NewDiagnostic(&ast.SourceFile{}, core.TextRange{}, diagnostics.No_overload_matches_this_call)
	func() {
		defer func() { assert.Equal(t, recover(), "stop") }()
		c.speculate(func() *Signature {
			links.setResolvedType(c, &Type{})
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
		host := &c.speculationHost
		cache := &speculatableCache[V]{}
		cache.set(host, original)
		c.speculate(func() *Signature {
			cache.set(host, outer)
			c.speculate(func() *Signature {
				cache.set(host, inner)
				return &Signature{}
			})
			assert.DeepEqual(t, cache.get(), inner, identity)
			// A parent write after an inner commit must not lose the parent's
			// original undo record, even when it writes the same cache again.
			cache.set(host, outer)
			c.speculate(func() *Signature {
				cache.set(host, inner)
				return nil
			})
			assert.DeepEqual(t, cache.get(), outer, identity)
			return nil
		})
		assert.DeepEqual(t, cache.get(), original, identity)
		assert.Equal(t, c.speculationHost.activeFrame, uint64(0))
		assert.Equal(t, c.speculationHost.checkpointCaches(), cacheCheckpoint{})
		c.speculate(func() *Signature {
			cache.set(host, outer)
			return &Signature{}
		})
		assert.DeepEqual(t, cache.get(), outer, identity)
		assert.Equal(t, c.speculationHost.checkpointCaches(), cacheCheckpoint{})
		// Reusing the journals after a root commit must restore the committed value.
		c.speculate(func() *Signature { cache.set(host, inner); return nil })
		assert.DeepEqual(t, cache.get(), outer, identity)
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
		// The discarded entry is removed. The parent's write creates a
		// different entry that must still be undone by the outer rollback.
		assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
		assert.Equal(t, cache.size(), 0)
		cache.set("new", RelationComparisonResultFailed)
		return nil
	})
	assert.Equal(t, cache.get("new"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 0)
}

func TestDiscardedEpochBitsetBoundaries(t *testing.T) {
	t.Parallel()
	host := &speculationHost{}
	assert.Assert(t, !host.isDiscardedEpoch(0))
	assert.Assert(t, !host.isDiscardedEpoch(1<<20))
	host.discardEpochs(63, 65)
	host.discardEpochs(127, 130)
	for epoch := uint64(0); epoch < 192; epoch++ {
		want := epoch >= 63 && epoch <= 65 || epoch >= 127 && epoch <= 130
		assert.Equal(t, host.isDiscardedEpoch(epoch), want)
	}
	// An enclosing rollback may overlap an earlier rollback and span several words.
	host.discardEpochs(64, 128)
	host.discardEpochs(511, 511)
	for epoch := uint64(0); epoch <= 512; epoch++ {
		want := epoch >= 63 && epoch <= 130 || epoch == 511
		assert.Equal(t, host.isDiscardedEpoch(epoch), want)
	}
}

// Compare observable reads with the original epoch-version stack. Keep reads
// explicit: reading a rejected version changes future escaped-symbol behavior.
func TestSymbolCacheReferenceEquivalence(t *testing.T) {
	t.Parallel()
	for seed := uint64(1); seed <= 32; seed++ {
		c := &Checker{}
		c.initializeSpeculation()
		random := seed
		next := func(n uint64) int {
			random ^= random << 13
			random ^= random >> 7
			random ^= random << 17
			return int(random % n)
		}
		type referenceValue struct {
			epoch uint64
			value *Type
		}
		type pair struct {
			links     ValueSymbolLinks
			birth     uint64 // Epoch of the frame that created the symbol.
			actual    speculatableSymbolCache[*Type]
			reference []referenceValue
		}
		pairs := []*pair{}
		values := []*Type{nil, {}, {}, {}, {}}
		expected := func(p *pair) *Type {
			var want *Type
			for len(p.reference) > 0 {
				v := p.reference[len(p.reference)-1]
				if !c.speculationHost.isDiscardedEpoch(p.birth) && c.speculationHost.isDiscardedEpoch(v.epoch) {
					p.reference = p.reference[:len(p.reference)-1]
					continue
				}
				want = v.value
				break
			}
			return want
		}
		read := func(p *pair) {
			assert.Equal(t, p.actual.get(&p.links), expected(p), "seed %d", seed)
		}
		// Once the root attempt ends, every symbol keeps its settled value. Symbols
		// born in a committed attempt then behave like stable symbols; symbols born
		// in a discarded attempt are never rolled back again.
		settle := func(p *pair) {
			p.reference = []referenceValue{{value: expected(p)}}
			if !c.speculationHost.isDiscardedEpoch(p.birth) {
				p.birth = 0
			}
		}
		var run func(int)
		run = func(depth int) {
			for step := 0; step < 40; step++ {
				if len(pairs) == 0 || next(8) == 0 {
					p := &pair{links: ValueSymbolLinks{host: &c.speculationHost}, birth: c.speculationHost.currentSpeculativeEpoch}
					if c.speculationHost.activeFrame != 0 {
						c.speculationHost.adoptSymbolBirth(&p.links, p.birth)
					}
					pairs = append(pairs, p)
				}
				p := pairs[next(uint64(len(pairs)))]
				switch next(5) {
				case 0:
					if depth < 3 {
						c.speculate(func() *Signature {
							run(depth + 1)
							if next(2) == 0 {
								return nil
							}
							return &Signature{}
						})
						if depth == 0 {
							for _, p := range pairs {
								settle(p)
							}
						}
					}
				case 1, 2:
					value := values[next(5)]
					p.actual.set(&p.links, value)
					epoch := c.speculationHost.currentSpeculativeEpoch
					if len(p.reference) > 0 && p.reference[len(p.reference)-1].epoch == epoch {
						p.reference[len(p.reference)-1].value = value
					} else {
						p.reference = append(p.reference, referenceValue{epoch: epoch, value: value})
					}
				default:
					read(p)
				}
			}
		}
		run(0)
		for _, p := range pairs {
			read(p)
		}
	}
}

func TestSpeculatableMapPreservesZeroValues(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	cache := speculatableMap[string, RelationComparisonResult]{host: &c.speculationHost}
	cache.set("existing", 0)
	assert.Equal(t, cache.get("existing"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 1)
	c.speculate(func() *Signature {
		cache.set("existing", RelationComparisonResultSucceeded)
		cache.set("rejected", 0)
		return nil
	})
	assert.Equal(t, cache.get("existing"), RelationComparisonResult(0))
	assert.Equal(t, cache.get("rejected"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 1)
	c.speculate(func() *Signature { cache.set("committed", 0); return &Signature{} })
	assert.Equal(t, cache.get("committed"), RelationComparisonResult(0))
	assert.Equal(t, cache.size(), 2)
}

func TestSpeculationSettlesNewSymbolOnCommit(t *testing.T) {
	t.Parallel()
	c := &Checker{}
	c.initializeSpeculation()
	var symbol *ast.Symbol
	original := &Type{}
	c.speculate(func() *Signature {
		symbol = c.newSymbol(ast.SymbolFlagsFunctionScopedVariable, "value")
		links := c.valueSymbolLinks.Get(symbol)
		links.setResolvedType(original)
		links.setFunctionOrConstructorChecked(true)
		c.speculate(func() *Signature {
			links.setResolvedType(&Type{})
			links.setFunctionOrConstructorChecked(false)
			return nil
		})
		// Do not read the rejected values before the owning attempt commits.
		return &Signature{}
	})
	links := c.valueSymbolLinks.Get(symbol)
	assert.Equal(t, links.getResolvedType(), original)
	assert.Assert(t, links.getFunctionOrConstructorChecked())
	assert.Equal(t, c.speculationHost.rootEpoch, uint64(0))
	assert.Equal(t, len(c.speculationHost.lazySymbolTypes.entries), 0)
	assert.Equal(t, len(c.speculationHost.lazySymbolBools.entries), 0)
	// The symbol is now stable and must participate in a later rollback.
	c.speculate(func() *Signature {
		links.setResolvedType(&Type{})
		links.setFunctionOrConstructorChecked(false)
		return nil
	})
	assert.Equal(t, links.getResolvedType(), original)
	assert.Assert(t, links.getFunctionOrConstructorChecked())
}
