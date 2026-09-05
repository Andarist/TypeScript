package checker

import (
	"math/rand/v2"
	"slices"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
)

func TestSpeculativeCollectionReferenceEquivalence(t *testing.T) {
	for seed := uint64(0); seed < 32; seed++ {
		rng := rand.New(rand.NewPCG(seed, 57421))
		c := &Checker{}
		c.initializeSpeculation()
		var expected []*ast.FlowNode
		var run func(int)
		run = func(depth int) {
			for step := 0; step < 40; step++ {
				switch rng.IntN(4) {
				case 0:
					flow := &ast.FlowNode{}
					c.sharedFlows = appendToSpeculativeSlice(c.sharedFlows, SharedFlow{flow: flow}, &c.speculationHost.protectedLengths.sharedFlows)
					expected = append(expected, flow)
				case 1:
					n := rng.IntN(len(expected) + 1)
					c.sharedFlows = c.sharedFlows[:n]
					expected = expected[:n]
				case 2:
					if depth < 3 {
						saved := slices.Clone(expected)
						success := rng.IntN(2) == 0
						c.speculate(func() *Signature {
							run(depth + 1)
							if success {
								return &Signature{}
							}
							return nil
						})
						if !success {
							expected = saved
						}
					}
				case 3:
					c.sharedFlows = nil
					expected = nil
				}
				if len(c.sharedFlows) != len(expected) {
					t.Fatalf("seed %d depth %d: length got %d want %d", seed, depth, len(c.sharedFlows), len(expected))
				}
				for i, v := range expected {
					if c.sharedFlows[i].flow != v {
						t.Fatalf("seed %d depth %d index %d: overwritten snapshot", seed, depth, i)
					}
				}
			}
		}
		run(0)
	}
}

func TestSpeculativeCallbackOverwrite(t *testing.T) {
	c := &Checker{}
	c.initializeSpeculation()
	observed := 0
	c.addDeferredDiagnostic(func() { observed = 1 })
	c.addDeferredDiagnostic(func() { observed = 2 })
	c.speculate(func() *Signature {
		c.deferredDiagnosticCallbacks = c.deferredDiagnosticCallbacks[:1]
		c.addDeferredDiagnostic(func() { observed = 3 })
		return nil
	})
	c.deferredDiagnosticCallbacks[1]()
	if observed != 2 {
		t.Fatal("failed attempt overwrote saved callback")
	}
}

func TestSpeculativeFlowStackRestoresProtection(t *testing.T) {
	c := &Checker{}
	c.initializeSpeculation()
	original := &Type{}
	c.flowLoopStack = []FlowLoopInfo{{}, {types: []*Type{original}}}
	c.speculate(func() *Signature {
		// checkExpressionCachedEx temporarily replaces the stack while checking
		// without the caller's flow context. Restore its protection with the stack.
		saved := c.flowLoopStack
		protection := c.speculationHost.protectedLengths.flowLoopStack
		c.flowLoopStack = nil
		c.speculationHost.protectedLengths.flowLoopStack = 0
		c.flowLoopStack = appendToSpeculativeSlice(c.flowLoopStack, FlowLoopInfo{}, &c.speculationHost.protectedLengths.flowLoopStack)
		c.flowLoopStack = saved
		c.speculationHost.protectedLengths.flowLoopStack = protection
		c.flowLoopStack = c.flowLoopStack[:1]
		c.flowLoopStack = appendToSpeculativeSlice(c.flowLoopStack, FlowLoopInfo{types: []*Type{{}}}, &c.speculationHost.protectedLengths.flowLoopStack)
		return nil
	})
	if len(c.flowLoopStack) != 2 || c.flowLoopStack[1].types[0] != original {
		t.Fatal("temporary stack lost the saved array's protection")
	}
}

func TestSpeculativeCollectionPanic(t *testing.T) {
	c := &Checker{}
	c.initializeSpeculation()
	original := &ast.FlowNode{}
	c.sharedFlows = []SharedFlow{{flow: original}}
	func() {
		defer func() {
			if recover() == nil {
				t.Error("expected panic")
			}
		}()
		c.speculate(func() *Signature {
			c.sharedFlows = c.sharedFlows[:0]
			c.sharedFlows = appendToSpeculativeSlice(c.sharedFlows, SharedFlow{flow: &ast.FlowNode{}}, &c.speculationHost.protectedLengths.sharedFlows)
			panic("abort attempt")
		})
	}()
	if len(c.sharedFlows) != 1 || c.sharedFlows[0].flow != original {
		t.Fatal("panic did not restore the saved collection")
	}
	if c.speculationHost.protectedLengths != (speculativeSliceProtection{}) {
		t.Fatal("root panic retained snapshot protection")
	}
}
