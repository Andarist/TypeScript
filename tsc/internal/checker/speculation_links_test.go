package checker

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
)

type countedSpeculationLinks struct {
	speculatableLinks
	initializations int
}

func (l *countedSpeculationLinks) setSpeculationHost(host *speculationHost) {
	l.host = host
	l.initializations++
}

func TestSpeculativeLinksInitializeOnce(t *testing.T) {
	h := &speculationHost{}
	ordinary := speculativeLinkStore[int, countedSpeculationLinks]{host: h}
	arena := speculativeSymbolArenaLinkStore[countedSpeculationLinks]{speculativeLinkStore: speculativeLinkStore[*ast.Symbol, countedSpeculationLinks]{host: h}}
	symbol := &ast.Symbol{}
	for _, tc := range []struct {
		name        string
		get, tryGet func() *countedSpeculationLinks
	}{
		{"ordinary", func() *countedSpeculationLinks { return ordinary.Get(1) }, func() *countedSpeculationLinks { return ordinary.TryGet(1) }},
		{"arena", func() *countedSpeculationLinks { return arena.Get(symbol) }, func() *countedSpeculationLinks { return arena.TryGet(symbol) }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if tc.tryGet() != nil {
				t.Fatal("TryGet created a link")
			}
			value := tc.get()
			for range 3 {
				if tc.get() != value || tc.tryGet() != value {
					t.Fatal("link identity changed")
				}
			}
			if value.host != h || value.initializations != 1 {
				t.Fatalf("host %p, initializations %d", value.host, value.initializations)
			}
		})
	}
}

func TestSpeculativePagedLinksInitializeSiblings(t *testing.T) {
	h := &speculationHost{}
	store := speculativeNodeLinkStore[countedSpeculationLinks]{speculativeLinkStore: speculativeLinkStore[*ast.Node, countedSpeculationLinks]{host: h}}
	// Assign three consecutive IDs, so at least one adjacent pair shares a page.
	nodes := []*ast.Node{{}, {}, {}}
	ids := []ast.NodeId{ast.GetNodeId(nodes[0]), ast.GetNodeId(nodes[1]), ast.GetNodeId(nodes[2])}
	first, second := 0, 1
	if uint64(ids[0])>>8 != uint64(ids[1])>>8 {
		first, second = 1, 2
	}
	if store.TryGet(nodes[first]) != nil {
		t.Fatal("TryGet allocated a page")
	}
	store.Get(nodes[first])
	sibling := store.TryGet(nodes[second])
	if sibling == nil || sibling.host != h || sibling.initializations != 1 {
		t.Fatal("sibling has no initialized host")
	}
	if store.Get(nodes[second]) != sibling || sibling.initializations != 1 {
		t.Fatal("Get reinitialized the sibling")
	}
}
