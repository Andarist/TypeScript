package ast

import (
	"fmt"
	"slices"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/diagnostics"
	"github.com/microsoft/TypeScript/tsc/internal/tspath"
	"gotest.tools/v3/assert"
)

func TestDiagnosticsCollectionDeduplicatesExactDiagnosticsOnAdd(t *testing.T) {
	t.Parallel()

	var collection DiagnosticsCollection
	first := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "x").
		AddRelatedInfo(NewCompilerDiagnostic(diagnostics.X_0_is_declared_here, "first"))
	second := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "x").
		AddRelatedInfo(NewCompilerDiagnostic(diagnostics.X_0_is_declared_here, "first"))
	different := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "x").
		AddRelatedInfo(NewCompilerDiagnostic(diagnostics.X_0_is_declared_here, "second"))

	if got := collection.Add(first); got != first {
		t.Fatalf("first Add() returned %p, want %p", got, first)
	}
	canonical := collection.Add(second)
	if canonical != first {
		t.Fatalf("second Add() returned %p, want canonical %p", canonical, first)
	}
	if got := collection.Add(different); got != different {
		t.Fatalf("different Add() returned %p, want %p", got, different)
	}

	canonical.AddRelatedInfo(NewCompilerDiagnostic(diagnostics.X_0_is_declared_here, "third"))
	collected := collection.GetGlobalDiagnostics()
	if len(collected) != 2 {
		t.Fatalf("GetGlobalDiagnostics() returned %d diagnostics, want 2", len(collected))
	}
	if got := len(first.RelatedInformation()); got != 2 {
		t.Fatalf("canonical diagnostic has %d related diagnostics, want 2", got)
	}
}

func TestDiagnosticsCollectionPreservesDistinctAdHocMessages(t *testing.T) {
	t.Parallel()

	var collection DiagnosticsCollection
	first := NewCompilerDiagnostic(diagnostics.NewAdHocMessage("first"))
	second := NewCompilerDiagnostic(diagnostics.NewAdHocMessage("second"))

	collection.Add(first)
	collection.Add(second)
	collected := collection.GetGlobalDiagnostics()
	if len(collected) != 2 {
		t.Fatalf("GetGlobalDiagnostics() returned %d diagnostics, want 2", len(collected))
	}
}

func TestDiagnosticsCollectionGetsDiagnosticsForEquivalentSourceFile(t *testing.T) {
	t.Parallel()

	path := tspath.Path("/src/file.ts")
	diagnosticFile := &SourceFile{
		parseOptions: SourceFileParseOptions{FileName: string(path), Path: path},
	}
	requestedFile := &SourceFile{
		parseOptions: SourceFileParseOptions{FileName: string(path), Path: path},
	}
	diagnostic := NewDiagnostic(diagnosticFile, core.TextRange{}, diagnostics.Cannot_find_name_0, "x")

	var collection DiagnosticsCollection
	collection.Add(diagnostic)

	collected := collection.GetDiagnosticsForFile(requestedFile)
	if len(collected) != 1 || collected[0] != diagnostic {
		t.Fatalf("GetDiagnosticsForFile() returned %v, want diagnostic for equivalent source file", collected)
	}
}

func TestExternalDiagnosticIdentity(t *testing.T) {
	t.Parallel()
	file := &SourceFile{parseOptions: SourceFileParseOptions{FileName: "/src/file.vue", Path: "/src/file.vue"}}
	loc := core.NewTextRange(1, 2)
	first := NewExternalDiagnostic(file, loc, "mapper-a", diagnostics.CategoryError, 0, "first")
	diagnostics := []*Diagnostic{
		first,
		NewExternalDiagnostic(file, loc, "mapper-a", diagnostics.CategoryError, 0, "second"),
		NewExternalDiagnostic(file, loc, "mapper-b", diagnostics.CategoryError, 0, "first"),
		NewExternalDiagnostic(file, loc, "mapper-a", diagnostics.CategoryWarning, 0, "first"),
	}

	var collection DiagnosticsCollection
	for _, diagnostic := range diagnostics {
		assert.Assert(t, !EqualDiagnosticsNoRelatedInfo(first, diagnostic) || diagnostic == first)
		assert.Assert(t, CompareDiagnostics(first, diagnostic) != 0 || diagnostic == first)
		collection.Add(diagnostic)
	}
	assert.Equal(t, len(collection.GetDiagnostics()), len(diagnostics))
}

func TestDiagnosticsCollectionCheckpointRestoresDeduplication(t *testing.T) {
	t.Parallel()
	var collection DiagnosticsCollection
	file := &SourceFile{}
	original := NewDiagnostic(file, core.TextRange{}, diagnostics.Cannot_find_name_0, "original")
	collision := NewDiagnostic(file, core.TextRange{}, diagnostics.Cannot_find_name_0, "collision")
	global := NewCompilerDiagnostic(diagnostics.Cannot_find_global_type_0, "Awaited")
	collection.Add(original)
	checkpoint := collection.Checkpoint()
	collection.Add(collision)
	collection.Add(global)
	// Reads must not change which diagnostics are removed on rollback.
	assert.Equal(t, len(collection.GetDiagnostics()), 3)
	collection.Revert(checkpoint)
	assert.Equal(t, len(collection.GetDiagnostics()), 1)
	assert.Equal(t, collection.Add(original), original)
	assert.Equal(t, collection.Add(collision), collision)
	assert.Equal(t, collection.Add(global), global)
	assert.Equal(t, len(collection.GetDiagnostics()), 3)
}

func TestDiagnosticsCollectionCheckpointNested(t *testing.T) {
	t.Parallel()
	for _, commitInner := range []bool{false, true} {
		for _, commitOuter := range []bool{false, true} {
			t.Run(fmt.Sprintf("innerCommit=%t/outerCommit=%t", commitInner, commitOuter), func(t *testing.T) {
				var collection DiagnosticsCollection
				file := &SourceFile{parseOptions: SourceFileParseOptions{FileName: "/file.ts", Path: "/file.ts"}}
				original := NewDiagnostic(file, core.NewTextRange(30, 31), diagnostics.Cannot_find_name_0, "z")
				parent := NewDiagnostic(file, core.NewTextRange(20, 21), diagnostics.Cannot_find_name_0, "parent")
				// Shares the deduplication key with original, but sorts before it.
				child := NewDiagnostic(file, original.Loc(), diagnostics.Cannot_find_name_0, "a")
				globalOriginal := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "z")
				globalParent := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "a")
				globalChild := NewCompilerDiagnostic(diagnostics.Cannot_find_name_0, "m")
				collection.Add(original)
				collection.Add(globalOriginal)
				collection.GetDiagnosticsForFile(file)
				collection.GetGlobalDiagnostics()
				outer := collection.Checkpoint()
				// Duplicate additions must not produce an undo entry.
				assert.Equal(t, collection.Add(NewDiagnostic(file, original.Loc(), diagnostics.Cannot_find_name_0, "z")), original)
				collection.Add(parent)
				collection.Add(globalParent)
				inner := collection.Checkpoint()
				collection.Add(child)
				collection.Add(globalChild)
				sortedFile := collection.GetDiagnosticsForFile(file)
				sortedGlobal := collection.GetGlobalDiagnostics()
				assert.Assert(t, slices.Equal(sortedFile, []*Diagnostic{parent, child, original}))
				assert.Assert(t, slices.Equal(sortedGlobal, []*Diagnostic{globalParent, globalChild, globalOriginal}))
				assert.Equal(t, collection.Lookup(child), child)
				if commitInner {
					collection.Commit(inner)
				} else {
					collection.Revert(inner)
				}
				// Repeat sorted reads between the two checkpoint boundaries.
				collection.GetDiagnosticsForFile(file)
				collection.GetGlobalDiagnostics()
				if commitOuter {
					collection.Commit(outer)
				} else {
					collection.Revert(outer)
				}
				want := []*Diagnostic{original, globalOriginal}
				if commitOuter {
					want = append(want, parent, globalParent)
					if commitInner {
						want = append(want, child, globalChild)
					}
				}
				slices.SortFunc(want, CompareDiagnostics)
				assert.Assert(t, slices.Equal(collection.GetDiagnostics(), want))
				assert.Equal(t, collection.count, len(want))
				assert.Equal(t, len(collection.undo), 0)
				assert.Equal(t, collection.checkpointID, uint64(0))
				// Returned slices remain valid after commit/rollback and further additions.
				assert.Assert(t, slices.Equal(sortedFile, []*Diagnostic{parent, child, original}))
				assert.Assert(t, slices.Equal(sortedGlobal, []*Diagnostic{globalParent, globalChild, globalOriginal}))
				assert.Equal(t, collection.Add(parent), parent)
				assert.Equal(t, collection.Add(child), child)
				assert.Equal(t, collection.Add(globalParent), globalParent)
				assert.Equal(t, collection.Add(globalChild), globalChild)
				assert.Equal(t, len(collection.GetDiagnostics()), 6)
			})
		}
	}
}

func TestDiagnosticsCollectionCheckpointRemovesNewFileAndIndex(t *testing.T) {
	t.Parallel()
	var collection DiagnosticsCollection
	file := &SourceFile{parseOptions: SourceFileParseOptions{FileName: "/new.ts", Path: "/new.ts"}}
	diagnostic := NewDiagnostic(file, core.TextRange{}, diagnostics.Cannot_find_name_0, "missing")
	checkpoint := collection.Checkpoint()
	collection.Add(diagnostic)
	collection.GetDiagnosticsForFile(file)
	collection.Revert(checkpoint)
	assert.Equal(t, len(collection.fileDiagnostics), 0)
	assert.Equal(t, len(collection.diagnosticIndex), 0)
	assert.Equal(t, len(collection.diagnosticCollisions), 0)
	assert.Equal(t, collection.Lookup(diagnostic), (*Diagnostic)(nil))
	assert.Equal(t, collection.Add(diagnostic), diagnostic)
	assert.Equal(t, len(collection.GetDiagnosticsForFile(file)), 1)
}
