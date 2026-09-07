package checker

import (
	"math"
	"slices"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
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
	maps             []speculatableMapJournal // Registered on first write, in a fixed order.
	bornLinks        []*ValueSymbolLinks      // Links of symbols created in the current root attempt.

	currentSpeculativeEpoch    uint64
	discardedSpeculativeEpochs []uint64
}

// Symbol links carry their host because reads of newly born symbols must
// consult the lazy history below. Node links pass the checker to their setters
// instead, keeping the hot node link structs free of pointers.
//
// Birth epochs only matter while the root attempt that created the symbol is
// active. They are stored in the links relative to the root attempt and cleared
// when it ends, so reads of the many stable symbols need only a single field test.
func (h *speculationHost) adoptSymbolBirth(links *ValueSymbolLinks, epoch uint64) {
	links.birthOffset = uint32(epoch - h.rootEpoch + 1)
	h.bornLinks = append(h.bornLinks, links)
}

func (h *speculationHost) birthEpoch(links *ValueSymbolLinks) uint64 {
	return h.rootEpoch + uint64(links.birthOffset) - 1
}

// Symbols born in a discarded attempt may have escaped into permanent state,
// such as the members of an interned union type, and are never rolled back.
const orphanBirthOffset = math.MaxUint32

func (h *speculationHost) finishSymbolBirths() {
	for _, links := range h.bornLinks {
		if h.isDiscardedEpoch(h.birthEpoch(links)) {
			links.birthOffset = orphanBirthOffset
		} else {
			links.birthOffset = 0
		}
	}
	clear(h.bornLinks)
	h.bornLinks = h.bornLinks[:0]
}

// Symbols predating the root attempt cannot acquire a discarded birth epoch
// later, so eager undo is safe. New symbols need lazy history until the root
// outcome settles whether their current values must survive.
type (
	symbolCacheValue                            interface{ *Type | bool }
	speculatableSymbolCache[V symbolCacheValue] struct{ value V }
)

func (s *speculatableSymbolCache[V]) get(links *ValueSymbolLinks) V {
	if links.birthOffset != 0 && links.birthOffset != orphanBirthOffset {
		h := links.host
		if birth := h.birthEpoch(links); birth != h.currentSpeculativeEpoch && !h.isDiscardedEpoch(birth) {
			h.readLazySymbolCache(s)
		}
	}
	return s.value
}

func (s *speculatableSymbolCache[V]) set(links *ValueSymbolLinks, value V) {
	if h := links.host; h.activeFrame != 0 {
		switch links.birthOffset {
		case 0:
			// Only stable symbols can skip an equal write: an equal write to a
			// new symbol may make a previously discarded value valid again.
			if s.value != value {
				h.recordStableSymbolCache(s)
			}
		case orphanBirthOffset:
		default:
			if birth := h.birthEpoch(links); birth != h.currentSpeculativeEpoch && !h.isDiscardedEpoch(birth) {
				h.recordLazySymbolCache(s, birth)
			}
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
	*Type | *Signature | *ast.Symbol | NodeCheckFlags | bool | ExhaustiveState | []*Type | []string
}

// Node caches hold only their value, so the link structs stay as small as plain
// fields. Every speculative write is journaled; undoing in reverse order makes
// repeated writes within one frame harmless.
type speculatableCache[V speculatableCacheValue] struct{ value V }

func (s *speculatableCache[V]) get() V { return s.value }

func (s *speculatableCache[V]) set(h *speculationHost, value V) {
	if h.activeFrame != 0 {
		h.recordCache(s)
	}
	s.value = value
}

type cacheUndo[V speculatableCacheValue] struct {
	cache    *speculatableCache[V]
	previous V
}
type cacheUndoLog[V speculatableCacheValue] struct{ entries []cacheUndo[V] }

func (l *cacheUndoLog[V]) record(cache *speculatableCache[V]) {
	l.entries = append(l.entries, cacheUndo[V]{cache, cache.value})
}

func (l *cacheUndoLog[V]) revert(position int) {
	for i := len(l.entries) - 1; i >= position; i-- {
		record := l.entries[i]
		record.cache.value = record.previous
	}
	clear(l.entries[position:])
	l.entries = l.entries[:position]
}

func (l *cacheUndoLog[V]) commit() {
	// Retain capacity for the next transaction, but release references to caches.
	clear(l.entries)
	l.entries = l.entries[:0]
}

// Maps keep plain values so the runtime need not scan per-entry objects; each
// map journals its own overwrites and registers with the host on first write.
type speculatableMap[K comparable, V any] struct {
	host     *speculationHost
	innerMap map[K]V
	undo     []mapUndo[K, V]
}

type mapUndo[K comparable, V any] struct {
	key      K
	previous V
	existed  bool
}

type speculatableMapJournal interface {
	mark() int
	revert(position int)
	commit()
}

const maxSpeculatableMaps = 16

func (s *speculatableMap[K, V]) get(key K) V { return s.innerMap[key] }

func (s *speculatableMap[K, V]) set(key K, value V) {
	if s.innerMap == nil {
		s.innerMap = make(map[K]V)
		s.host.registerMap(s)
	}
	if s.host.activeFrame != 0 {
		previous, existed := s.innerMap[key]
		s.undo = append(s.undo, mapUndo[K, V]{key, previous, existed})
	}
	s.innerMap[key] = value
}

func (s *speculatableMap[K, V]) size() int { return len(s.innerMap) }

func (s *speculatableMap[K, V]) mark() int { return len(s.undo) }

func (s *speculatableMap[K, V]) revert(position int) {
	for i := len(s.undo) - 1; i >= position; i-- {
		record := s.undo[i]
		if record.existed {
			s.innerMap[record.key] = record.previous
		} else {
			delete(s.innerMap, record.key)
		}
	}
	clear(s.undo[position:])
	s.undo = s.undo[:position]
}

func (s *speculatableMap[K, V]) commit() {
	clear(s.undo)
	s.undo = s.undo[:0]
}

func (h *speculationHost) registerMap(m speculatableMapJournal) {
	if len(h.maps) == maxSpeculatableMaps {
		panic("too many speculatable maps")
	}
	h.maps = append(h.maps, m)
}

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
	permanentDiagnostics        int
	protectedLengths            speculativeSliceProtection
	flowLoopStack               []FlowLoopInfo
	sharedFlows                 []SharedFlow
	deferredDiagnosticCallbacks []func()
	diagnostics                 ast.DiagnosticsCollectionCheckpoint
	suggestions                 ast.DiagnosticsCollectionCheckpoint
}

func (c *Checker) snapshotCheckerState() savedCheckerState {
	state := savedCheckerState{
		permanentDiagnostics:        len(c.permanentDiagnosticLog),
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
	// Permanent type caches retain resolution errors. Replay only errors first
	// reported since this snapshot; enclosing attempts keep their own log prefix.
	for _, diagnostic := range c.permanentDiagnosticLog[state.permanentDiagnostics:] {
		c.diagnostics.Add(diagnostic)
	}
	c.flowLoopStack = state.flowLoopStack
	c.sharedFlows = state.sharedFlows
	c.deferredDiagnosticCallbacks = state.deferredDiagnosticCallbacks
}

func (c *Checker) initializeSpeculation() {
	c.valueSymbolLinks.host = &c.speculationHost
	c.flowLoopCache.host = &c.speculationHost
	c.contextFreeTypes.host = &c.speculationHost
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
			c.speculationHost.finishSymbolBirths()
			c.speculationHost.rootEpoch = 0
			clear(c.permanentDiagnosticLog)
			c.permanentDiagnosticLog = c.permanentDiagnosticLog[:0]
			c.speculationHost.protectedLengths = speculativeSliceProtection{}
		}
	}()
	return cb()
}

// Value symbol links learn their host when created so their accessors can
// consult the lazy symbol history without a checker in hand.
type valueSymbolLinkStore struct {
	symbolArenaLinkStore[ValueSymbolLinks]
	host *speculationHost
}

func (s *valueSymbolLinkStore) Get(symbol *ast.Symbol) *ValueSymbolLinks {
	link := s.store.Get(uint64(ast.GetSymbolId(symbol)))
	if *link == nil {
		links := s.arena.New()
		links.host = s.host
		*link = links
	}
	return *link
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
	maps         [maxSpeculatableMaps]int
}

func (h *speculationHost) checkpointCaches() cacheCheckpoint {
	checkpoint := cacheCheckpoint{
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
	}
	for i, m := range h.maps {
		checkpoint.maps[i] = m.mark()
	}
	return checkpoint
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
	// Maps registered after the checkpoint have a zero mark and revert entirely.
	for i, m := range h.maps {
		m.revert(c.maps[i])
	}
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
	for _, m := range h.maps {
		m.commit()
	}
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
