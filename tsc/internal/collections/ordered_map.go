package collections

import (
	"encoding"
	"errors"
	"iter"
	"maps"
	"reflect"
	"slices"
	"strconv"

	"github.com/microsoft/TypeScript/tsc/internal/json"
)

// OrderedMap is an insertion ordered map.
//
// The entries are kept in insertion order in one slice. Most maps are small, so a map is searched linearly until it
// has more than orderedMapLinearMax entries, and only then gets an index of entry positions by key.
type OrderedMap[K comparable, V any] struct {
	_       noCopy
	entries []MapEntry[K, V]
	index   map[K]int32
}

// orderedMapLinearMax is the size up to which a map is searched linearly instead of through its index.
const orderedMapLinearMax = 8

// noCopy may be embedded into structs which must not be copied
// after the first use.
//
// See https://golang.org/issues/8005#issuecomment-190753527
// for details.
type noCopy struct{}

// Lock is a no-op used by -copylocks checker from `go vet`.
func (*noCopy) Lock()   {}
func (*noCopy) Unlock() {}

// NewOrderedMapWithSizeHint creates a new OrderedMap with a hint for the number of elements it will contain.
func NewOrderedMapWithSizeHint[K comparable, V any](hint int) *OrderedMap[K, V] {
	m := newMapWithSizeHint[K, V](hint)
	return &m
}

func newMapWithSizeHint[K comparable, V any](hint int) OrderedMap[K, V] {
	var index map[K]int32
	if hint > orderedMapLinearMax {
		index = make(map[K]int32, hint)
	}
	return OrderedMap[K, V]{entries: make([]MapEntry[K, V], 0, hint), index: index}
}

type MapEntry[K comparable, V any] struct {
	Key   K
	Value V
}

func NewOrderedMapFromList[K comparable, V any](items []MapEntry[K, V]) *OrderedMap[K, V] {
	mp := NewOrderedMapWithSizeHint[K, V](len(items))
	for _, item := range items {
		mp.Set(item.Key, item.Value)
	}
	return mp
}

func (m *OrderedMap[K, V]) find(key K) int {
	if m == nil {
		return -1
	}
	if m.index != nil {
		if i, ok := m.index[key]; ok {
			return int(i)
		}
		return -1
	}
	for i := range m.entries {
		if m.entries[i].Key == key {
			return i
		}
	}
	return -1
}

func (m *OrderedMap[K, V]) buildIndex() {
	m.index = make(map[K]int32, len(m.entries))
	for i := range m.entries {
		m.index[m.entries[i].Key] = int32(i)
	}
}

// Set sets a key-value pair in the map.
func (m *OrderedMap[K, V]) Set(key K, value V) {
	if i := m.find(key); i >= 0 {
		m.entries[i].Value = value
		return
	}
	m.entries = append(m.entries, MapEntry[K, V]{key, value})
	if m.index != nil {
		m.index[key] = int32(len(m.entries) - 1)
	} else if len(m.entries) > orderedMapLinearMax {
		m.buildIndex()
	}
}

// Get retrieves a value from the map.
func (m *OrderedMap[K, V]) Get(key K) (V, bool) {
	if i := m.find(key); i >= 0 {
		return m.entries[i].Value, true
	}
	var zero V
	return zero, false
}

// GetOrZero retrieves a value from the map, or returns the zero value of the value type if the key is not present.
func (m *OrderedMap[K, V]) GetOrZero(key K) V {
	v, _ := m.Get(key)
	return v
}

// EntryAt retrieves the key-value pair at the specified index.
func (m *OrderedMap[K, V]) EntryAt(index int) (K, V, bool) {
	if m == nil || index < 0 || index >= len(m.entries) {
		var zero K
		var zeroV V
		return zero, zeroV, false
	}
	return m.entries[index].Key, m.entries[index].Value, true
}

// Has returns true if the map contains the key.
func (m *OrderedMap[K, V]) Has(key K) bool {
	return m.find(key) >= 0
}

// Delete removes a key-value pair from the map.
func (m *OrderedMap[K, V]) Delete(key K) (V, bool) {
	i := m.find(key)
	if i < 0 {
		var zero V
		return zero, false
	}
	v := m.entries[i].Value
	// If we're just removing the first element, avoid shifting everything around.
	if i == 0 {
		m.entries[0] = MapEntry[K, V]{}
		m.entries = m.entries[1:]
	} else {
		m.entries = slices.Delete(m.entries, i, i+1)
	}
	if m.index != nil {
		delete(m.index, key)
		if i == 0 {
			for j := range m.entries {
				m.index[m.entries[j].Key] = int32(j)
			}
		} else {
			for j := i; j < len(m.entries); j++ {
				m.index[m.entries[j].Key] = int32(j)
			}
		}
	}
	return v, true
}

// Keys returns an iterator over the keys in the map.
// A slice of the keys can be obtained by calling `slices.Collect`.
func (m *OrderedMap[K, V]) Keys() iter.Seq[K] {
	return func(yield func(K) bool) {
		if m == nil {
			return
		}
		// We use a for loop here to ensure we enumerate new items added during iteration.
		//nolint:intrange
		for i := 0; i < len(m.entries); i++ {
			if !yield(m.entries[i].Key) {
				break
			}
		}
	}
}

// Values returns an iterator over the values in the map.
// A slice of the values can be obtained by calling `slices.Collect`.
func (m *OrderedMap[K, V]) Values() iter.Seq[V] {
	return func(yield func(V) bool) {
		if m == nil {
			return
		}
		// We use a for loop here to ensure we enumerate new items added during iteration.
		//nolint:intrange
		for i := 0; i < len(m.entries); i++ {
			if !yield(m.entries[i].Value) {
				break
			}
		}
	}
}

// Entries returns an iterator over the key-value pairs in the map.
func (m *OrderedMap[K, V]) Entries() iter.Seq2[K, V] {
	return func(yield func(K, V) bool) {
		if m == nil {
			return
		}
		// We use a for loop here to ensure we enumerate new items added during iteration.
		//nolint:intrange
		for i := 0; i < len(m.entries); i++ {
			if !yield(m.entries[i].Key, m.entries[i].Value) {
				break
			}
		}
	}
}

// Clear removes all key-value pairs from the map.
// The space allocated for the map will be reused.
func (m *OrderedMap[K, V]) Clear() {
	clear(m.entries)
	m.entries = m.entries[:0]
	clear(m.index)
}

// Size returns the number of key-value pairs in the map.
func (m *OrderedMap[K, V]) Size() int {
	if m == nil {
		return 0
	}
	return len(m.entries)
}

// Clone returns a shallow copy of the map.
func (m *OrderedMap[K, V]) Clone() *OrderedMap[K, V] {
	if m == nil {
		return nil
	}
	m2 := m.clone()
	return &m2
}

func (m *OrderedMap[K, V]) clone() OrderedMap[K, V] {
	return OrderedMap[K, V]{
		entries: slices.Clone(m.entries),
		index:   maps.Clone(m.index),
	}
}

// EqualFunc compares keys in insertion order and values using equal.
// A nil map differs from a non-nil empty map; backing-storage allocation is ignored.
func (m *OrderedMap[K, V]) EqualFunc(other *OrderedMap[K, V], equal func(V, V) bool) bool {
	if m == other {
		return true
	}
	if m == nil || other == nil {
		return false
	}
	return slices.EqualFunc(m.entries, other.entries, func(a, b MapEntry[K, V]) bool {
		return a.Key == b.Key && equal(a.Value, b.Value)
	})
}

var _ json.MarshalerTo = (*OrderedMap[string, string])(nil)

func (m *OrderedMap[K, V]) MarshalJSONTo(enc *json.Encoder) error {
	if err := enc.WriteToken(json.BeginObject); err != nil {
		return err
	}

	for _, entry := range m.entries {
		k := entry.Key
		// TODO: is this needed? Can we just MarshalEncode k directly?
		keyString, err := resolveKeyName(reflect.ValueOf(k))
		if err != nil {
			return err
		}

		if err := json.MarshalEncode(enc, keyString); err != nil {
			return err
		}

		if err := json.MarshalEncode(enc, entry.Value); err != nil {
			return err
		}
	}

	return enc.WriteToken(json.EndObject)
}

func resolveKeyName(k reflect.Value) (string, error) {
	if k.Kind() == reflect.String {
		return k.String(), nil
	}
	if tm, ok := reflect.TypeAssert[encoding.TextMarshaler](k); ok {
		if k.Kind() == reflect.Pointer && k.IsNil() {
			return "", nil
		}
		buf, err := tm.MarshalText()
		return string(buf), err
	}
	switch k.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return strconv.FormatInt(k.Int(), 10), nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return strconv.FormatUint(k.Uint(), 10), nil
	}
	panic("unexpected map key type")
}

var _ json.UnmarshalerFrom = (*OrderedMap[string, string])(nil)

func (m *OrderedMap[K, V]) UnmarshalJSONFrom(dec *json.Decoder) error {
	token, err := dec.ReadToken()
	if err != nil {
		return err
	}
	if token.Kind() == 'n' { // json.Null.Kind()
		// By convention, to approximate the behavior of Unmarshal itself,
		// Unmarshalers implement UnmarshalJSON([]byte("null")) as a no-op.
		// https://pkg.go.dev/encoding/json#Unmarshaler
		// TODO: reconsider
		return nil
	}
	if token.Kind() != '{' { // json.ObjectStart.Kind()
		return errors.New("cannot unmarshal non-object JSON value into Map")
	}
	for dec.PeekKind() != '}' { // json.ObjectEnd.Kind()
		var key K
		var value V
		if err := json.UnmarshalDecode(dec, &key); err != nil {
			return err
		}
		if err := json.UnmarshalDecode(dec, &value); err != nil {
			return err
		}
		m.Set(key, value)
	}
	if _, err := dec.ReadToken(); err != nil {
		return err
	}
	return nil
}

func DiffOrderedMaps[K comparable, V comparable](m1 *OrderedMap[K, V], m2 *OrderedMap[K, V], onAdded func(key K, value V), onRemoved func(key K, value V), onModified func(key K, oldValue V, newValue V)) {
	DiffOrderedMapsFunc(m1, m2, func(a, b V) bool {
		return a == b
	}, onAdded, onRemoved, onModified)
}

func DiffOrderedMapsFunc[K comparable, V any](m1 *OrderedMap[K, V], m2 *OrderedMap[K, V], equalValues func(a, b V) bool, onAdded func(key K, value V), onRemoved func(key K, value V), onModified func(key K, oldValue V, newValue V)) {
	for k, v2 := range m2.Entries() {
		if _, ok := m1.Get(k); !ok {
			onAdded(k, v2)
		}
	}
	for k, v1 := range m1.Entries() {
		if v2, ok := m2.Get(k); ok {
			if !equalValues(v1, v2) {
				onModified(k, v1, v2)
			}
		} else {
			onRemoved(k, v1)
		}
	}
}
