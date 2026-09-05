package checker

import (
	"maps"
	"slices"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
)

// This follows the speculation helpers in microsoft/TypeScript#57421.
type speculationHost struct {
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

// Explicit accessors replace the upstream SpeculatableCache decorator. Reads
// lazily remove discarded writes, including successful nested speculations.
type speculatableCache[V any] struct{ values []epochValue[V] }

func (s *speculatableCache[V]) get(links *speculatableLinks) V {
	// Symbols born in a discarded epoch may escape through permanent caches.
	// Upstream preserves their values even during subsequent failed speculations.
	for len(s.values) > 0 {
		last := s.values[len(s.values)-1]
		if links.host != nil && !links.host.discardedSpeculativeEpochs[links.symbolEpoch] && links.host.discardedSpeculativeEpochs[last.epoch] {
			var zero epochValue[V]
			s.values[len(s.values)-1] = zero
			s.values = s.values[:len(s.values)-1]
			continue
		}
		return last.value
	}
	var zero V
	return zero
}
func (s *speculatableCache[V]) set(links *speculatableLinks, value V) {
	var epoch uint64
	if links.host != nil {
		epoch = links.host.currentSpeculativeEpoch
	}
	if len(s.values) > 0 && s.values[len(s.values)-1].epoch == epoch {
		s.values[len(s.values)-1].value = value
	} else {
		s.values = append(s.values, epochValue[V]{epoch, value})
	}
}

type speculatableMap[K comparable, V any] struct {
	host     *speculationHost
	innerMap map[K]*speculatableCache[V]
}

func (s *speculatableMap[K, V]) get(key K) V {
	if list := s.innerMap[key]; list != nil {
		value := list.get(&speculatableLinks{host: s.host})
		if len(list.values) == 0 {
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
	list := s.innerMap[key]
	if list == nil {
		list = &speculatableCache[V]{}
		s.innerMap[key] = list
	}
	list.set(&speculatableLinks{host: s.host}, value)
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

type savedCheckerState struct{ restores []func() }

func (c *Checker) registerSpeculativeCache(save func() func()) {
	c.speculativeCaches = append(c.speculativeCaches, save)
}
func (c *Checker) snapshotCheckerState() savedCheckerState {
	state := savedCheckerState{}
	for _, save := range c.speculativeCaches {
		state.restores = append(state.restores, save())
	}
	return state
}
func (c *Checker) restoreCheckerState(state savedCheckerState) {
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
	c.registerSpeculativeCache(func() func() { old := maps.Clone(c.flowLoopCache); return func() { c.flowLoopCache = old } })
	c.registerSpeculativeCache(func() func() { old := slices.Clone(c.flowLoopStack); return func() { c.flowLoopStack = old } })
	c.registerSpeculativeCache(func() func() { old := slices.Clone(c.sharedFlows); return func() { c.sharedFlows = old } })
	c.registerSpeculativeCache(func() func() {
		old := slices.Clone(c.deferredDiagnosticCallbacks)
		return func() { c.deferredDiagnosticCallbacks = old }
	})
	c.registerSpeculativeCache(func() func() {
		old := c.diagnostics.Checkpoint()
		return func() {
			c.diagnostics.Revert(old)
			// Go's permanent type caches retain resolution errors across speculation.
			for _, diagnostic := range c.permanentDiagnostics.GetDiagnostics() {
				c.diagnostics.Add(diagnostic)
			}
		}
	})
	c.registerSpeculativeCache(func() func() {
		old := c.suggestionDiagnostics.Checkpoint()
		return func() { c.suggestionDiagnostics.Revert(old) }
	})
}

func (c *Checker) speculate(cb func() *Signature) (result *Signature) {
	c.speculationHost.currentSpeculativeEpoch++
	startEpoch := c.speculationHost.currentSpeculativeEpoch
	initialState := c.snapshotCheckerState()
	defer func() {
		endEpoch := c.speculationHost.currentSpeculativeEpoch
		c.speculationHost.currentSpeculativeEpoch++
		if result == nil {
			if c.speculationHost.discardedSpeculativeEpochs == nil {
				c.speculationHost.discardedSpeculativeEpochs = make(map[uint64]bool)
			}
			for epoch := startEpoch; epoch <= endEpoch; epoch++ {
				c.speculationHost.discardedSpeculativeEpochs[epoch] = true
			}
			c.restoreCheckerState(initialState)
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
