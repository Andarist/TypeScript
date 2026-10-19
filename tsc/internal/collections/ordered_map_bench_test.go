package collections_test

import (
	"fmt"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/collections"
)

var (
	benchSinkInt  int
	benchSinkBool bool
)

type benchNode struct{ id int }

func benchStringKeys(n int) []string {
	keys := make([]string, n)
	for i := range keys {
		keys[i] = fmt.Sprintf("property%d", i)
	}
	return keys
}

func benchPointerKeys(n int) []*benchNode {
	keys := make([]*benchNode, n)
	for i := range keys {
		keys[i] = &benchNode{i}
	}
	return keys
}

var benchSizes = []int{2, 8, 16, 64, 1024}

// BenchmarkOrderedMapBuild builds a map without a size hint, like most callers do.
func BenchmarkOrderedMapBuild(b *testing.B) {
	for _, n := range benchSizes {
		keys := benchStringKeys(n)
		b.Run(fmt.Sprintf("string/n=%d", n), func(b *testing.B) {
			b.ReportAllocs()
			for b.Loop() {
				var m collections.OrderedMap[string, int]
				for i, k := range keys {
					m.Set(k, i)
				}
				benchSinkInt += m.Size()
			}
		})
		ptrs := benchPointerKeys(n)
		b.Run(fmt.Sprintf("pointer/n=%d", n), func(b *testing.B) {
			b.ReportAllocs()
			for b.Loop() {
				var s collections.OrderedSet[*benchNode]
				for _, k := range ptrs {
					s.Add(k)
				}
				benchSinkInt += s.Size()
			}
		})
	}
}

// BenchmarkOrderedMapLookup looks up every key once and as many missing keys.
func BenchmarkOrderedMapLookup(b *testing.B) {
	for _, n := range benchSizes {
		keys := benchStringKeys(n)
		missing := benchStringKeys(2 * n)[n:]
		var m collections.OrderedMap[string, int]
		for i, k := range keys {
			m.Set(k, i)
		}
		b.Run(fmt.Sprintf("string/n=%d", n), func(b *testing.B) {
			for b.Loop() {
				for _, k := range keys {
					v, _ := m.Get(k)
					benchSinkInt += v
				}
				for _, k := range missing {
					benchSinkBool = m.Has(k)
				}
			}
		})
		ptrs := benchPointerKeys(n)
		var s collections.OrderedSet[*benchNode]
		for _, k := range ptrs {
			s.Add(k)
		}
		b.Run(fmt.Sprintf("pointer/n=%d", n), func(b *testing.B) {
			for b.Loop() {
				for _, k := range ptrs {
					benchSinkBool = s.Has(k)
				}
			}
		})
	}
}

// BenchmarkOrderedMapIterate iterates over every entry.
func BenchmarkOrderedMapIterate(b *testing.B) {
	for _, n := range benchSizes {
		keys := benchStringKeys(n)
		var m collections.OrderedMap[string, int]
		for i, k := range keys {
			m.Set(k, i)
		}
		b.Run(fmt.Sprintf("string/n=%d", n), func(b *testing.B) {
			for b.Loop() {
				for k, v := range m.Entries() {
					benchSinkInt += len(k) + v
				}
			}
		})
	}
}
