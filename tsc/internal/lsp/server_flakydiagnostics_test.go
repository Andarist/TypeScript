package lsp_test

import (
	"context"
	"fmt"
	"io"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/bundled"
	"github.com/microsoft/TypeScript/tsc/internal/lsp"
	"github.com/microsoft/TypeScript/tsc/internal/lsp/lsproto"
	"github.com/microsoft/TypeScript/tsc/internal/testutil/lsptestutil"
	"github.com/microsoft/TypeScript/tsc/internal/vfs/vfstest"
	"gotest.tools/v3/assert"
)

// Regression test for https://github.com/microsoft/TypeScript/issues/64458.
//
// With trackFlakyDiagnostics enabled, handleDocumentDiagnostic calls Program.Emit
// with the textDocument/diagnostic request context. With noEmitOnError, Emit runs
// GetSemanticDiagnostics(ctx, nil), which checks every file on its own goroutine.
// Those workers used to inherit the request ID, so the project checker pool's
// request affinity handed the single diagnostics checker to all of them at once,
// crashing the server (e.g. "concurrent map read and map write"). Under -race this
// reliably reports data races on checker state.
func TestFlakyDiagnosticsNoEmitOnErrorDoesNotShareChecker(t *testing.T) {
	t.Parallel()
	if !bundled.Embedded {
		t.Skip("bundled files are not embedded")
	}

	const fileCount = 12
	files := map[string]string{
		"/home/projects/tsconfig.json": `{ "compilerOptions": { "strict": true, "module": "nodenext", "noEmitOnError": true, "declaration": true, "outDir": "out" } }`,
	}
	for i := range fileCount {
		var b strings.Builder
		if i > 0 {
			fmt.Fprintf(&b, "import { v%[1]d_0, type Box%[1]d_0 } from \"./file%[1]d.js\";\n", i-1)
			fmt.Fprintf(&b, "export const imported%d: Box%d_0<string> = v%d_0;\n", i, i-1, i-1)
		}
		for j := range 20 {
			fmt.Fprintf(&b, `
export type Box%[1]d_%[2]d<T> = { value: T; map<U>(f: (x: T) => U): Box%[1]d_%[2]d<U> };
export interface Base%[1]d_%[2]d<T> { run(cb: (b: Box%[1]d_%[2]d<T>) => void): void; next(p: Box%[1]d_%[2]d<T>): Base%[1]d_%[2]d<T> }
export interface Derived%[1]d_%[2]d<T> extends Base%[1]d_%[2]d<T> { next(p: Box%[1]d_%[2]d<T>): Derived%[1]d_%[2]d<T> }
export declare const v%[1]d_%[2]d: Box%[1]d_%[2]d<string>;
export function f%[1]d_%[2]d(d: Derived%[1]d_%[2]d<number>): Base%[1]d_%[2]d<number> { let x = d.next({ value: 1, map: (f) => v%[1]d_%[2]d.map(() => f(1)) }); return x; }
`, i, j)
		}
		files[fmt.Sprintf("/home/projects/file%d.ts", i)] = b.String()
	}

	onServerRequest := func(_ context.Context, req *lsproto.RequestMessage) *lsproto.ResponseMessage {
		switch req.Method {
		case lsproto.MethodClientRegisterCapability, lsproto.MethodClientUnregisterCapability, lsproto.MethodWindowWorkDoneProgressCreate:
			return &lsproto.ResponseMessage{ID: req.ID, JSONRPC: req.JSONRPC, Result: lsproto.Null{}}
		default:
			return nil
		}
	}

	client, closeClient := lsptestutil.NewLSPClient(t, lsp.ServerOptions{
		Err:                io.Discard,
		Cwd:                "/home/projects",
		FS:                 bundled.WrapFS(vfstest.FromMap(files, false)),
		DefaultLibraryPath: bundled.LibPath(),
	}, onServerRequest)
	t.Cleanup(func() { _ = closeClient() })

	flakeLevel := lsproto.DiagnosticFlakeLogLevelPanic
	initMsg, _, ok := client.SendRequest(t, lsproto.InitializeInfo, &lsproto.InitializeParams{
		Capabilities: &lsproto.ClientCapabilities{},
		InitializationOptions: &lsproto.InitializationOptionsOrNull{
			InitializationOptions: &lsproto.InitializationOptions{TrackFlakyDiagnostics: &flakeLevel},
		},
	})
	assert.Assert(t, ok && initMsg.AsResponse().Error == nil, "Initialize failed")
	client.SendNotification(t, lsproto.InitializedInfo, &lsproto.InitializedParams{})
	<-client.Server.InitComplete()

	const fileName = "/home/projects/file0.ts"
	uri := lsproto.DocumentUri("file://" + fileName)
	client.SendNotification(t, lsproto.TextDocumentDidOpenInfo, &lsproto.DidOpenTextDocumentParams{
		TextDocument: &lsproto.TextDocumentItem{Uri: uri, LanguageId: lsproto.LanguageKindTypeScript, Text: files[fileName]},
	})

	id := client.NextID()
	reqID := lsproto.NewID(lsproto.IntegerOrString{Integer: &id})
	req := lsproto.TextDocumentDiagnosticInfo.NewRequestMessage(reqID, &lsproto.DocumentDiagnosticParams{
		TextDocument: lsproto.TextDocumentIdentifier{Uri: uri},
	})
	resp, ok := client.SendRequestWorker(t, req, reqID)
	assert.Assert(t, ok, "expected a response")
	if resp.Error != nil {
		t.Fatalf("textDocument/diagnostic failed: %s", resp.Error.String())
	}
}
