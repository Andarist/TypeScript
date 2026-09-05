package checker

import (
	"slices"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
)

// This follows the speculation helpers in microsoft/TypeScript#57421.
type speculationHost struct {
	protectedLengths speculativeSliceProtection
	rootEpoch        uint64 // Zero outside speculation; otherwise the outermost start epoch.
	symbolTypes      symbolUndoLog[*Type]
	symbolBools      symbolUndoLog[bool]
	lazySymbolTypes  lazySymbolCaches[*Type]
	lazySymbolBools  lazySymbolCaches[bool]
	activeFrame      uint64
	types            cacheUndoLog[*Type]
	signatures       cacheUndoLog[*Signature]
	symbols          cacheUndoLog[*ast.Symbol]
	flags            cacheUndoLog[NodeCheckFlags]
	bools            cacheUndoLog[bool]
	exhaustive       cacheUndoLog[ExhaustiveState]
	typeSlices       cacheUndoLog[[]*Type]
	stringSlices     cacheUndoLog[[]string]
	relations        cacheUndoLog[RelationComparisonResult]

	currentSpeculativeEpoch    uint64
	discardedSpeculativeEpochs []uint64
}

type speculatableLinks struct {
	host *speculationHost
}

// Only symbols need a birth epoch: node caches always participate in rollback.
type speculatableSymbolLinks struct {
	speculatableLinks
	symbolEpoch uint64
}

func (l *speculatableLinks) setSpeculationHost(host *speculationHost) { l.host = host }

// Symbols predating the root attempt cannot acquire a discarded birth epoch
// later, so eager undo is safe. New symbols need lazy history until the root
// outcome settles whether their current values must survive.
type (
	symbolCacheValue                            interface{ *Type | bool }
	speculatableSymbolCache[V symbolCacheValue] struct{ value V }
)

func (s *speculatableSymbolCache[V]) get(links *speculatableSymbolLinks) V {
	h := links.host
	if h != nil && h.rootEpoch != 0 && links.symbolEpoch >= h.rootEpoch && links.symbolEpoch != h.currentSpeculativeEpoch && !h.isDiscardedEpoch(links.symbolEpoch) {
		h.readLazySymbolCache(s)
	}
	return s.value
}

func (s *speculatableSymbolCache[V]) set(links *speculatableSymbolLinks, value V) {
	h := links.host
	if h != nil && h.activeFrame != 0 && links.symbolEpoch != h.currentSpeculativeEpoch && !h.isDiscardedEpoch(links.symbolEpoch) {
		if links.symbolEpoch < h.rootEpoch {
			// Only stable symbols can skip an equal write: an equal write to a
			// new symbol may make a previously discarded value valid again.
			if s.value != value {
				h.recordStableSymbolCache(s)
			}
		} else {
			h.recordLazySymbolCache(s, links.symbolEpoch)
		}
	}
	s.value = value
}

type (
	symbolUndo[V symbolCacheValue] struct {
		cache    *speculatableSymbolCache[V]
		previous V
	}
	symbolUndoLog[V symbolCacheValue] struct{ entries []symbolUndo[V] }
)

func (l *symbolUndoLog[V]) record(cache *speculatableSymbolCache[V]) {
	l.entries = append(l.entries, symbolUndo[V]{cache, cache.value})
}

func (l *symbolUndoLog[V]) revert(position int) {
	for i := len(l.entries) - 1; i >= position; i-- {
		r := l.entries[i]
		r.cache.value = r.previous
	}
	clear(l.entries[position:])
	l.entries = l.entries[:position]
}

func (l *symbolUndoLog[V]) commit() {
	clear(l.entries)
	l.entries = l.entries[:0]
}

type (
	lazySymbolHistory[V symbolCacheValue] struct {
		epoch         uint64
		birthEpoch    uint64
		previousValue V
		previous      *lazySymbolHistory[V]
	}
	lazySymbolCaches[V symbolCacheValue] struct {
		entries map[*speculatableSymbolCache[V]]*lazySymbolHistory[V]
	}
)

func (l *lazySymbolCaches[V]) record(cache *speculatableSymbolCache[V], birth, epoch uint64) {
	previous := l.entries[cache]
	if previous == nil || previous.epoch != epoch {
		if l.entries == nil {
			l.entries = make(map[*speculatableSymbolCache[V]]*lazySymbolHistory[V])
		}
		l.entries[cache] = &lazySymbolHistory[V]{epoch: epoch, birthEpoch: birth, previousValue: cache.value, previous: previous}
	}
}

func (l *lazySymbolCaches[V]) read(cache *speculatableSymbolCache[V], h *speculationHost) {
	state := l.entries[cache]
	if state == nil || !h.isDiscardedEpoch(state.epoch) {
		return
	}
	for state != nil && h.isDiscardedEpoch(state.epoch) {
		cache.value = state.previousValue
		state = state.previous
	}
	if state == nil {
		delete(l.entries, cache)
	} else {
		l.entries[cache] = state
	}
}

// At root commit, surviving symbols can discard rejected versions eagerly:
// their birth epoch can no longer be rolled back. Root failure preserves the
// latest value of every newly born symbol, including unread rejected writes.
func (l *lazySymbolCaches[V]) finish(h *speculationHost, committed bool) {
	if committed {
		for cache, state := range l.entries {
			if !h.isDiscardedEpoch(state.birthEpoch) {
				l.read(cache, h)
			}
		}
	}
	clear(l.entries)
}

func (h *speculationHost) recordStableSymbolCache(cache any) {
	switch c := cache.(type) {
	case *speculatableSymbolCache[*Type]:
		h.symbolTypes.record(c)
	case *speculatableSymbolCache[bool]:
		h.symbolBools.record(c)
	default:
		panic("unsupported symbol cache")
	}
}

func (h *speculationHost) recordLazySymbolCache(cache any, birth uint64) {
	switch c := cache.(type) {
	case *speculatableSymbolCache[*Type]:
		h.lazySymbolTypes.record(c, birth, h.currentSpeculativeEpoch)
	case *speculatableSymbolCache[bool]:
		h.lazySymbolBools.record(c, birth, h.currentSpeculativeEpoch)
	default:
		panic("unsupported symbol cache")
	}
}

func (h *speculationHost) readLazySymbolCache(cache any) {
	switch c := cache.(type) {
	case *speculatableSymbolCache[*Type]:
		h.lazySymbolTypes.read(c, h)
	case *speculatableSymbolCache[bool]:
		h.lazySymbolBools.read(c, h)
	default:
		panic("unsupported symbol cache")
	}
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
	writeFrame uint64
	value      V
}

func (s *speculatableCache[V]) get(_ *speculatableLinks) V { return s.value }

// Zero is absent; one is a non-speculative write; active frames are encoded +1.
func (s *speculatableCache[V]) set(links *speculatableLinks, value V) {
	frame := uint64(1)
	if links.host != nil && links.host.activeFrame != 0 {
		frame = links.host.activeFrame + 1
		if s.writeFrame != frame {
			links.host.recordCache(s)
		}
	}
	s.writeFrame = frame
	s.value = value
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
		if cache.writeFrame == 0 {
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

func (s *speculativeLinkStore[K, V]) initialize(value *V) *V {
	if value != nil {
		any(value).(interface{ setSpeculationHost(*speculationHost) }).setSpeculationHost(s.host)
	}
	return value
}

// Hosts belong to the store and do not change after a link is created.
func (s *speculativeLinkStore[K, V]) Get(key K) *V {
	if value := s.store.TryGet(key); value != nil {
		return value
	}
	return s.initialize(s.store.Get(key))
}
func (s *speculativeLinkStore[K, V]) TryGet(key K) *V { return s.store.TryGet(key) }
func (s *speculativeLinkStore[K, V]) Has(key K) bool  { return s.store.Has(key) }

// Each length protects elements visible through a saved slice. Appending beyond
// it is safe; overwriting a protected element first allocates a new backing array.
// Bounds may conservatively include snapshots that have already committed.
type speculativeSliceProtection struct {
	flowLoopStack               int
	sharedFlows                 int
	deferredDiagnosticCallbacks int
}

// Save slice headers; appendToSpeculativeSlice protects their existing elements.
type savedCheckerState struct {
	protectedLengths            speculativeSliceProtection
	flowLoopStack               []FlowLoopInfo
	sharedFlows                 []SharedFlow
	deferredDiagnosticCallbacks []func()
	diagnostics                 ast.DiagnosticsCollectionCheckpoint
	suggestions                 ast.DiagnosticsCollectionCheckpoint
}

func (c *Checker) snapshotCheckerState() savedCheckerState {
	state := savedCheckerState{
		protectedLengths:            c.speculationHost.protectedLengths,
		diagnostics:                 c.diagnostics.Checkpoint(),
		suggestions:                 c.suggestionDiagnostics.Checkpoint(),
		flowLoopStack:               c.flowLoopStack,
		sharedFlows:                 c.sharedFlows,
		deferredDiagnosticCallbacks: c.deferredDiagnosticCallbacks,
	}
	c.speculationHost.protectedLengths.flowLoopStack = max(c.speculationHost.protectedLengths.flowLoopStack, len(c.flowLoopStack))
	c.speculationHost.protectedLengths.sharedFlows = max(c.speculationHost.protectedLengths.sharedFlows, len(c.sharedFlows))
	c.speculationHost.protectedLengths.deferredDiagnosticCallbacks = max(c.speculationHost.protectedLengths.deferredDiagnosticCallbacks, len(c.deferredDiagnosticCallbacks))
	return state
}

func (c *Checker) commitCheckerState(state savedCheckerState) {
	c.diagnostics.Commit(state.diagnostics)
	c.suggestionDiagnostics.Commit(state.suggestions)
}

func (c *Checker) restoreCheckerState(state savedCheckerState) {
	c.speculationHost.protectedLengths = state.protectedLengths
	c.diagnostics.Revert(state.diagnostics)
	c.suggestionDiagnostics.Revert(state.suggestions)
	// Go's permanent type caches retain resolution errors across speculation.
	for _, diagnostic := range c.permanentDiagnostics.GetDiagnostics() {
		c.diagnostics.Add(diagnostic)
	}
	c.flowLoopStack = state.flowLoopStack
	c.sharedFlows = state.sharedFlows
	c.deferredDiagnosticCallbacks = state.deferredDiagnosticCallbacks
}

func (c *Checker) initializeSpeculation() {
	c.nodeLinks.host = &c.speculationHost
	c.signatureLinks.host = &c.speculationHost
	c.symbolNodeLinks.host = &c.speculationHost
	c.typeNodeLinks.host = &c.speculationHost
	c.assertionLinks.host = &c.speculationHost
	c.switchStatementLinks.host = &c.speculationHost
	c.valueSymbolLinks.host = &c.speculationHost
}

func (c *Checker) speculate(cb func() *Signature) (result *Signature) {
	c.speculationHost.currentSpeculativeEpoch++
	startEpoch := c.speculationHost.currentSpeculativeEpoch
	initialState := c.snapshotCheckerState()
	previousFrame := c.speculationHost.activeFrame
	if previousFrame == 0 {
		c.speculationHost.rootEpoch = startEpoch
	}
	c.speculationHost.activeFrame = startEpoch
	caches := c.speculationHost.checkpointCaches()
	defer func() {
		endEpoch := c.speculationHost.currentSpeculativeEpoch
		c.speculationHost.activeFrame = previousFrame
		c.speculationHost.currentSpeculativeEpoch++
		if result == nil {
			c.speculationHost.discardEpochs(startEpoch, endEpoch)
			c.speculationHost.revertCaches(caches)
			c.restoreCheckerState(initialState)
		} else {
			c.commitCheckerState(initialState)
			// Inner commits keep their records so an outer failure can undo them.
			if previousFrame == 0 {
				c.speculationHost.commitCaches()
			}
		}
		if previousFrame == 0 {
			c.speculationHost.lazySymbolTypes.finish(&c.speculationHost, result != nil)
			c.speculationHost.lazySymbolBools.finish(&c.speculationHost, result != nil)
			c.speculationHost.rootEpoch = 0
			c.speculationHost.protectedLengths = speculativeSliceProtection{}
		}
	}()
	return cb()
}

// Retain the paged backing stores used for dense node and symbol IDs.
type speculativeNodeLinkStore[V any] struct {
	speculativeLinkStore[*ast.Node, V]
	backing nodeLinkStore[V]
}

func (s *speculativeNodeLinkStore[V]) initializeLink(value *V) { s.initialize(value) }

func (s *speculativeNodeLinkStore[V]) Get(node *ast.Node) *V {
	return s.backing.store.GetWithInitializer(uint64(ast.GetNodeId(node)), s.initializeLink)
}

func (s *speculativeNodeLinkStore[V]) TryGet(node *ast.Node) *V {
	return s.backing.TryGet(node)
}

func (s *speculativeNodeLinkStore[V]) Has(node *ast.Node) bool { return s.backing.Has(node) }

type speculativeSymbolArenaLinkStore[V any] struct {
	speculativeLinkStore[*ast.Symbol, V]
	backing symbolArenaLinkStore[V]
}

func (s *speculativeSymbolArenaLinkStore[V]) Get(symbol *ast.Symbol) *V {
	if value := s.backing.TryGet(symbol); value != nil {
		return value
	}
	return s.initialize(s.backing.Get(symbol))
}

func (s *speculativeSymbolArenaLinkStore[V]) TryGet(symbol *ast.Symbol) *V {
	return s.backing.TryGet(symbol)
}

func (s *speculativeSymbolArenaLinkStore[V]) Has(symbol *ast.Symbol) bool {
	return s.backing.Has(symbol)
}

type cacheCheckpoint struct {
	symbolTypes  int
	symbolBools  int
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
		symbolTypes:  len(h.symbolTypes.entries),
		symbolBools:  len(h.symbolBools.entries),
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
	h.symbolTypes.revert(c.symbolTypes)
	h.symbolBools.revert(c.symbolBools)
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
	h.symbolTypes.commit()
	h.symbolBools.commit()
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

// Epochs are sequential; a bitset avoids hashing on symbol-cache reads.
func (h *speculationHost) isDiscardedEpoch(epoch uint64) bool {
	word := epoch >> 6
	return word < uint64(len(h.discardedSpeculativeEpochs)) && h.discardedSpeculativeEpochs[word]&(uint64(1)<<(epoch&63)) != 0
}

func (h *speculationHost) discardEpochs(start, end uint64) {
	count := int(end>>6) + 1
	if count > len(h.discardedSpeculativeEpochs) {
		h.discardedSpeculativeEpochs = slices.Grow(h.discardedSpeculativeEpochs, count-len(h.discardedSpeculativeEpochs))[:count]
	}
	for epoch := start; epoch <= end; epoch++ {
		h.discardedSpeculativeEpochs[epoch>>6] |= uint64(1) << (epoch & 63)
	}
}

// All appends to the three snapshotted collections must use this helper.
// Truncation and nil assignments do not overwrite elements and need no copy.
func appendToSpeculativeSlice[T any](values []T, value T, protectedLength *int) []T {
	if len(values) < *protectedLength {
		// Force append to allocate. The new array is not shared with any snapshot.
		values = slices.Clip(values)
		*protectedLength = 0
	}
	return append(values, value)
}
