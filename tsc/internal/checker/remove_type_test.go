package checker

import (
	"fmt"
	"slices"
	"testing"
)

func TestRemoveTypePreservesCanonicalUnion(t *testing.T) {
	for _, count := range []int{3, 4, 60} {
		for _, cached := range []bool{false, true} {
			for _, removed := range []int{0, count / 2, count - 1} {
				t.Run(fmt.Sprintf("size%d/cached%v/remove%d", count, cached, removed), func(t *testing.T) {
					c := &Checker{unionTypes: make(map[CacheHashKey]*Type)}
					members := make([]*Type, count)
					for i := range members {
						members[i] = c.newIntrinsicType(TypeFlagsString, fmt.Sprint(i))
					}
					original := slices.Clone(members)
					union := c.getUnionTypeFromSortedList(members, ObjectFlagsPrimitiveUnion, nil, nil)
					expectedMembers := slices.Delete(slices.Clone(members), removed, removed+1)
					var expected *Type
					if cached {
						expected = c.getUnionTypeFromSortedList(expectedMembers, ObjectFlagsPrimitiveUnion, nil, nil)
					}
					result := c.removeType(union, members[removed])
					if !cached {
						expected = c.getUnionTypeFromSortedList(expectedMembers, ObjectFlagsPrimitiveUnion, nil, nil)
					}
					if result != expected {
						t.Fatal("removed union did not reuse its canonical type")
					}
					if !slices.Equal(result.Types(), expectedMembers) {
						t.Fatal("wrong remaining constituents")
					}
					if !slices.Equal(union.Types(), original) {
						t.Fatal("removal mutated the original union")
					}
					if c.removeType(union, members[removed]) != result {
						t.Fatal("repeated removal changed identity")
					}
					if c.removeType(union, c.newIntrinsicType(TypeFlagsNumber, "absent")) != union {
						t.Fatal("removing absent type changed union")
					}
				})
			}
		}
	}
}
