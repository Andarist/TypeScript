package checker

import (
	"slices"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
)

// This follows the speculation helpers in microsoft/TypeScript#57421.
type speculationHost struct {
	activeFrame  uint64
	types        cacheUndoLog[*Type]
	signatures   cacheUndoLog[*Signature]
	symbols      cacheUndoLog[*ast.Symbol]
	flags        cacheUndoLog[NodeCheckFlags]
	bools        cacheUndoLog[bool]
	exhaustive   cacheUndoLog[ExhaustiveState]
	typeSlices   cacheUndoLog[[]*Type]
	stringSlices cacheUndoLog[[]string]
	relations    cacheUndoLog[RelationComparisonResult]

	currentSpeculativeEpoch    uint64
	discardedSpeculativeEpochs map[uint64]bool
}

type speculatableLinks struct {
	host        *speculationHost
	symbolEpoch uint64
}

func (l *speculatableLinks) setSpeculationHost(host *speculationHost) { l.host = host }

type epochValue[V any] struct {
	epoch uint64
	value V
}

// Symbol caches must invalidate lazily: a symbol born in a discarded epoch
// retains its cached values, including unread writes from a discarded inner
// speculation. Eager rollback would lose those values before the symbol escapes.
// Inline the newest version and allocate history only on a second epoch write.
// Epochs are encoded plus one so zero means an unwritten cache.
type speculatableSymbolCache[V any] struct {
	current epochValue[V]
	history *cacheHistory[V]
}
type cacheHistory[V any] struct{ values []epochValue[V] }

func (s *speculatableSymbolCache[V]) get(links *speculatableLinks) V {
	if links.host != nil && !links.host.discardedSpeculativeEpochs[links.symbolEpoch] {
		for s.current.epoch != 0 && links.host.discardedSpeculativeEpochs[s.current.epoch-1] {
			if s.history == nil || len(s.history.values) == 0 {
				s.current = epochValue[V]{}
				break
			}
			last := len(s.history.values) - 1
			s.current = s.history.values[last]
			s.history.values[last] = epochValue[V]{}
			s.history.values = s.history.values[:last]
		}
	}
	return s.current.value
}

func (s *speculatableSymbolCache[V]) set(links *speculatableLinks, value V) {
	epoch := uint64(1)
	if links.host != nil {
		epoch = links.host.currentSpeculativeEpoch + 1
	}
	if s.current.epoch != 0 && s.current.epoch != epoch {
		if s.history == nil {
			s.history = &cacheHistory[V]{}
		}
		s.history.values = append(s.history.values, s.current)
	}
	s.current = epochValue[V]{epoch, value}
}

// Keep this constraint and recordCache in sync when adding a cache value type.
// Exact types prevent an unsupported cache from silently skipping rollback.
type speculatableCacheValue interface {
	*Type | *Signature | *ast.Symbol | NodeCheckFlags | bool | ExhaustiveState |
		[]*Type | []string | RelationComparisonResult
}

// Node and map caches keep their current value directly. Before overwriting a
// value from another frame, save it along with its frame for nested rollback.
type speculatableCache[V speculatableCacheValue] struct {
	value      V
	writeFrame uint64
	present    bool
}

func (s *speculatableCache[V]) get(_ *speculatableLinks) V { return s.value }
func (s *speculatableCache[V]) set(links *speculatableLinks, value V) {
	if links.host != nil && links.host.activeFrame != 0 && s.writeFrame != links.host.activeFrame {
		links.host.recordCache(s)
		s.writeFrame = links.host.activeFrame
	}
	s.value = value
	s.present = true
}

type cacheUndo[V speculatableCacheValue] struct {
	cache    *speculatableCache[V]
	previous speculatableCache[V]
}
type cacheUndoLog[V speculatableCacheValue] struct{ entries []cacheUndo[V] }

func (l *cacheUndoLog[V]) record(cache *speculatableCache[V]) {
	l.entries = append(l.entries, cacheUndo[V]{cache, *cache})
}

func (l *cacheUndoLog[V]) revert(position int) {
	for i := len(l.entries) - 1; i >= position; i-- {
		record := l.entries[i]
		*record.cache = record.previous
	}
	clear(l.entries[position:])
	l.entries = l.entries[:position]
}

func (l *cacheUndoLog[V]) commit() {
	// Retain capacity for the next transaction, but release references to caches.
	clear(l.entries)
	l.entries = l.entries[:0]
}

type speculatableMap[K comparable, V speculatableCacheValue] struct {
	host     *speculationHost
	innerMap map[K]*speculatableCache[V]
}

func (s *speculatableMap[K, V]) get(key K) V {
	if cache := s.innerMap[key]; cache != nil {
		value := cache.value
		if !cache.present {
			delete(s.innerMap, key)
		}
		return value
	}
	var zero V
	return zero
}

func (s *speculatableMap[K, V]) set(key K, value V) {
	if s.innerMap == nil {
		s.innerMap = make(map[K]*speculatableCache[V])
	}
	cache := s.innerMap[key]
	if cache == nil {
		cache = &speculatableCache[V]{}
		s.innerMap[key] = cache
	}
	cache.set(&speculatableLinks{host: s.host}, value)
}

// Approximate, matching upstream: discarded entries are removed on access.
func (s *speculatableMap[K, V]) size() int { return len(s.innerMap) }

type speculativeLinkStore[K comparable, V any] struct {
	store core.LinkStore[K, V]
	host  *speculationHost
}

func (s *speculativeLinkStore[K, V]) track(_ K, value *V) *V {
	if value != nil {
		any(value).(interface{ setSpeculationHost(*speculationHost) }).setSpeculationHost(s.host)
	}
	return value
}
func (s *speculativeLinkStore[K, V]) Get(key K) *V    { return s.track(key, s.store.Get(key)) }
func (s *speculativeLinkStore[K, V]) TryGet(key K) *V { return s.track(key, s.store.TryGet(key)) }
func (s *speculativeLinkStore[K, V]) Has(key K) bool  { return s.store.Has(key) }

type savedCheckerState struct {
	restores    []func()
	diagnostics ast.DiagnosticsCollectionCheckpoint
	suggestions ast.DiagnosticsCollectionCheckpoint
}

func (c *Checker) registerSpeculativeCache(save func() func()) {
	c.speculativeCaches = append(c.speculativeCaches, save)
}

func (c *Checker) snapshotCheckerState() savedCheckerState {
	state := savedCheckerState{
		restores:    make([]func(), len(c.speculativeCaches)),
		diagnostics: c.diagnostics.Checkpoint(),
		suggestions: c.suggestionDiagnostics.Checkpoint(),
	}
	for i, save := range c.speculativeCaches {
		state.restores[i] = save()
	}
	return state
}

func (c *Checker) commitCheckerState(state savedCheckerState) {
	c.diagnostics.Commit(state.diagnostics)
	c.suggestionDiagnostics.Commit(state.suggestions)
}

func (c *Checker) restoreCheckerState(state savedCheckerState) {
	c.diagnostics.Revert(state.diagnostics)
	c.suggestionDiagnostics.Revert(state.suggestions)
	// Go's permanent type caches retain resolution errors across speculation.
	for _, diagnostic := range c.permanentDiagnostics.GetDiagnostics() {
		c.diagnostics.Add(diagnostic)
	}
	for _, restore := range state.restores {
		restore()
	}
}

func (c *Checker) initializeSpeculation() {
	c.nodeLinks.host = &c.speculationHost
	c.signatureLinks.host = &c.speculationHost
	c.symbolNodeLinks.host = &c.speculationHost
	c.typeNodeLinks.host = &c.speculationHost
	c.assertionLinks.host = &c.speculationHost
	c.switchStatementLinks.host = &c.speculationHost
	c.valueSymbolLinks.host = &c.speculationHost
	c.registerSpeculativeCache(func() func() { old := slices.Clone(c.flowLoopStack); return func() { c.flowLoopStack = old } })
	c.registerSpeculativeCache(func() func() { old := slices.Clone(c.sharedFlows); return func() { c.sharedFlows = old } })
	c.registerSpeculativeCache(func() func() {
		old := slices.Clone(c.deferredDiagnosticCallbacks)
		return func() { c.deferredDiagnosticCallbacks = old }
	})
}

func (c *Checker) speculate(cb func() *Signature) (result *Signature) {
	c.speculationHost.currentSpeculativeEpoch++
	startEpoch := c.speculationHost.currentSpeculativeEpoch
	initialState := c.snapshotCheckerState()
	previousFrame := c.speculationHost.activeFrame
	c.speculationHost.activeFrame = startEpoch
	caches := c.speculationHost.checkpointCaches()
	defer func() {
		endEpoch := c.speculationHost.currentSpeculativeEpoch
		c.speculationHost.activeFrame = previousFrame
		c.speculationHost.currentSpeculativeEpoch++
		if result == nil {
			if c.speculationHost.discardedSpeculativeEpochs == nil {
				c.speculationHost.discardedSpeculativeEpochs = make(map[uint64]bool)
			}
			for epoch := startEpoch; epoch <= endEpoch; epoch++ {
				c.speculationHost.discardedSpeculativeEpochs[epoch] = true
			}
			c.speculationHost.revertCaches(caches)
			c.restoreCheckerState(initialState)
		} else {
			c.commitCheckerState(initialState)
			// Inner commits keep their records so an outer failure can undo them.
			if previousFrame == 0 {
				c.speculationHost.commitCaches()
			}
		}
	}()
	return cb()
}

// Retain the paged backing stores used for dense node and symbol IDs.
type speculativeNodeLinkStore[V any] struct {
	speculativeLinkStore[*ast.Node, V]
	backing nodeLinkStore[V]
}

func (s *speculativeNodeLinkStore[V]) Get(node *ast.Node) *V {
	return s.track(node, s.backing.Get(node))
}

func (s *speculativeNodeLinkStore[V]) TryGet(node *ast.Node) *V {
	return s.track(node, s.backing.TryGet(node))
}

func (s *speculativeNodeLinkStore[V]) Has(node *ast.Node) bool { return s.backing.Has(node) }

type speculativeSymbolArenaLinkStore[V any] struct {
	speculativeLinkStore[*ast.Symbol, V]
	backing symbolArenaLinkStore[V]
}

func (s *speculativeSymbolArenaLinkStore[V]) Get(symbol *ast.Symbol) *V {
	if value := s.backing.TryGet(symbol); value != nil {
		return s.track(symbol, value)
	}
	return s.track(symbol, s.backing.Get(symbol))
}

func (s *speculativeSymbolArenaLinkStore[V]) TryGet(symbol *ast.Symbol) *V {
	return s.track(symbol, s.backing.TryGet(symbol))
}

func (s *speculativeSymbolArenaLinkStore[V]) Has(symbol *ast.Symbol) bool {
	return s.backing.Has(symbol)
}

type cacheCheckpoint struct {
	types        int
	signatures   int
	symbols      int
	flags        int
	bools        int
	exhaustive   int
	typeSlices   int
	stringSlices int
	relations    int
}

func (h *speculationHost) checkpointCaches() cacheCheckpoint {
	return cacheCheckpoint{
		types:        len(h.types.entries),
		signatures:   len(h.signatures.entries),
		symbols:      len(h.symbols.entries),
		flags:        len(h.flags.entries),
		bools:        len(h.bools.entries),
		exhaustive:   len(h.exhaustive.entries),
		typeSlices:   len(h.typeSlices.entries),
		stringSlices: len(h.stringSlices.entries),
		relations:    len(h.relations.entries),
	}
}

func (h *speculationHost) revertCaches(c cacheCheckpoint) {
	h.types.revert(c.types)
	h.signatures.revert(c.signatures)
	h.symbols.revert(c.symbols)
	h.flags.revert(c.flags)
	h.bools.revert(c.bools)
	h.exhaustive.revert(c.exhaustive)
	h.typeSlices.revert(c.typeSlices)
	h.stringSlices.revert(c.stringSlices)
	h.relations.revert(c.relations)
}

func (h *speculationHost) commitCaches() {
	h.types.commit()
	h.signatures.commit()
	h.symbols.commit()
	h.flags.commit()
	h.bools.commit()
	h.exhaustive.commit()
	h.typeSlices.commit()
	h.stringSlices.commit()
	h.relations.commit()
}

// Typed journals store records by value, avoiding a heap allocation per write.
func (h *speculationHost) recordCache(cache any) {
	switch cache := cache.(type) {
	case *speculatableCache[*Type]:
		h.types.record(cache)
	case *speculatableCache[*Signature]:
		h.signatures.record(cache)
	case *speculatableCache[*ast.Symbol]:
		h.symbols.record(cache)
	case *speculatableCache[NodeCheckFlags]:
		h.flags.record(cache)
	case *speculatableCache[bool]:
		h.bools.record(cache)
	case *speculatableCache[ExhaustiveState]:
		h.exhaustive.record(cache)
	case *speculatableCache[[]*Type]:
		h.typeSlices.record(cache)
	case *speculatableCache[[]string]:
		h.stringSlices.record(cache)
	case *speculatableCache[RelationComparisonResult]:
		h.relations.record(cache)
	default:
		panic("unhandled speculative cache type")
	}
}
