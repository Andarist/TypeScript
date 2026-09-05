package core

import "testing"

func TestPagedLinkStoreInitializer(t *testing.T) {
	var store PagedLinkStore[int]
	calls := 0
	initialize := func(value *int) { calls++; *value = 7 }
	for _, key := range []uint64{0, pageSize, maxPageCount << pageShift} {
		if store.TryGet(key) != nil {
			t.Fatal("page exists before allocation")
		}
		before := calls
		value := store.GetWithInitializer(key, initialize)
		if calls-before != pageSize {
			t.Fatalf("initialized %d entries, want %d", calls-before, pageSize)
		}
		sibling := store.TryGet(key + 1)
		if sibling == nil || *sibling != 7 {
			t.Fatal("TryGet exposed an uninitialized sibling")
		}
		*value = 42
		if store.GetWithInitializer(key, initialize) != value || *value != 42 {
			t.Fatal("existing entry was replaced or reinitialized")
		}
		if store.GetWithInitializer(key+1, initialize) != sibling {
			t.Fatal("sibling address changed")
		}
		if calls-before != pageSize {
			t.Fatal("existing page was initialized again")
		}
	}
}
