currentDirectory::/home/src/workspaces/project
useCaseSensitiveFileNames::true
Input::
//// [/home/src/workspaces/project/a.ts] *new* 
import * as MA from "./ma";
export const fromA = MA.pa;
//// [/home/src/workspaces/project/b.ts] *new* 
import * as MB from "./mb";
export const fromB = MB.pb;
//// [/home/src/workspaces/project/c.ts] *new* 
export const c = 1;
//// [/home/src/workspaces/project/ma.js] *new* 
export { v as pa } from "./xa";
export const ma = 1;
//// [/home/src/workspaces/project/mb.js] *new* 
export { v as pb } from "./xb";
export const mb = 1;
//// [/home/src/workspaces/project/tsconfig.json] *new* 
{"compilerOptions": {"incremental": true, "noCheck": true, "module": "commonjs", "allowJs": true, "declaration": true, "outDir": "out", "types": []}}
//// [/home/src/workspaces/project/xa.js] *new* 
/** @type {typeof import("./mb")} */
const M = /** @type {any} */ (null);
const o = { v: { ...M } };
module.exports = o;
//// [/home/src/workspaces/project/xb.js] *new* 
/** @type {typeof import("./ma")} */
const M = /** @type {any} */ (null);
const o = { v: { ...M } };
module.exports = o;

tsgo --singleThreaded
ExitStatus:: Success
Output::
//// [/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts] *Lib*
/// <reference no-default-lib="true"/>
interface Boolean {}
interface Function {}
interface CallableFunction {}
interface NewableFunction {}
interface IArguments {}
interface Number { toExponential: any; }
interface Object {}
interface RegExp {}
interface String { charAt: any; }
interface Array<T> { length: number; [n: number]: T; }
interface ReadonlyArray<T> {}
interface SymbolConstructor {
    (desc?: string | number): symbol;
    for(name: string): symbol;
    readonly toStringTag: symbol;
}
declare var Symbol: SymbolConstructor;
interface Symbol {
    readonly [Symbol.toStringTag]: string;
}
declare const console: { log(msg: any): void; };
//// [/home/src/workspaces/project/out/a.d.ts] *new* 
export declare const fromA: any;

//// [/home/src/workspaces/project/out/a.js] *new* 
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromA = void 0;
const MA = __importStar(require("./ma"));
exports.fromA = MA.pa;

//// [/home/src/workspaces/project/out/b.d.ts] *new* 
export declare const fromB: any;

//// [/home/src/workspaces/project/out/b.js] *new* 
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromB = void 0;
const MB = __importStar(require("./mb"));
exports.fromB = MB.pb;

//// [/home/src/workspaces/project/out/c.d.ts] *new* 
export declare const c = 1;

//// [/home/src/workspaces/project/out/c.js] *new* 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.c = void 0;
exports.c = 1;

//// [/home/src/workspaces/project/out/ma.d.ts] *new* 
export { v as pa } from "./xa";
export declare const ma = 1;

//// [/home/src/workspaces/project/out/ma.js] *new* 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ma = exports.pa = void 0;
var xa_1 = require("./xa");
Object.defineProperty(exports, "pa", { enumerable: true, get: function () { return xa_1.v; } });
exports.ma = 1;

//// [/home/src/workspaces/project/out/mb.d.ts] *new* 
export { v as pb } from "./xb";
export declare const mb = 1;

//// [/home/src/workspaces/project/out/mb.js] *new* 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb = exports.pb = void 0;
var xb_1 = require("./xb");
Object.defineProperty(exports, "pb", { enumerable: true, get: function () { return xb_1.v; } });
exports.mb = 1;

//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo] *new* 
{"version":"FakeTSVersion","checkPending":true,"root":[[2,8]],"fileNames":["lib.es2026.full.d.ts","../xb.js","../mb.js","../xa.js","../ma.js","../a.ts","../b.ts","../c.ts"],"fileInfos":[{"version":"8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };","affectsGlobalScope":true,"impliedNodeFormat":1},{"version":"6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;","signature":"978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n","impliedNodeFormat":1},{"version":"4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"d91c8efebe9551dd7614d2ab77f9be77-export { v as pa } from \"./xa\";\nexport const ma = 1;","signature":"ff1fc23e206af2f8a502b87f650411e5-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\n","impliedNodeFormat":1},{"version":"8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;","signature":"1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n","impliedNodeFormat":1},{"version":"d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;","signature":"b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n","impliedNodeFormat":1},{"version":"da771f73da4798394bcb22005e5008d1-export const c = 1;","signature":"ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n","impliedNodeFormat":1}],"fileIdsList":[[5],[3],[4],[2]],"options":{"allowJs":true,"declaration":true,"module":1,"outDir":"./"},"referencedMap":[[6,1],[7,2],[5,3],[3,4],[4,2],[2,1]],"semanticDiagnosticsPerFile":[1,2,3,4,5,6,7,8]}
//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo.readable.baseline.txt] *new* 
{
  "version": "FakeTSVersion",
  "checkPending": true,
  "root": [
    {
      "files": [
        "../xb.js",
        "../mb.js",
        "../xa.js",
        "../ma.js",
        "../a.ts",
        "../b.ts",
        "../c.ts"
      ],
      "original": [
        2,
        8
      ]
    }
  ],
  "fileNames": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "fileInfos": [
    {
      "fileName": "lib.es2026.full.d.ts",
      "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "signature": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "affectsGlobalScope": true,
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true,
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xb.js",
      "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../mb.js",
      "version": "4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;",
      "signature": "978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;",
        "signature": "978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xa.js",
      "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../ma.js",
      "version": "d91c8efebe9551dd7614d2ab77f9be77-export { v as pa } from \"./xa\";\nexport const ma = 1;",
      "signature": "ff1fc23e206af2f8a502b87f650411e5-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "d91c8efebe9551dd7614d2ab77f9be77-export { v as pa } from \"./xa\";\nexport const ma = 1;",
        "signature": "ff1fc23e206af2f8a502b87f650411e5-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../a.ts",
      "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
      "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
        "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../b.ts",
      "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
      "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
        "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../c.ts",
      "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
      "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
        "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
        "impliedNodeFormat": 1
      }
    }
  ],
  "fileIdsList": [
    [
      "../ma.js"
    ],
    [
      "../mb.js"
    ],
    [
      "../xa.js"
    ],
    [
      "../xb.js"
    ]
  ],
  "options": {
    "allowJs": true,
    "declaration": true,
    "module": 1,
    "outDir": "./"
  },
  "referencedMap": {
    "../a.ts": [
      "../ma.js"
    ],
    "../b.ts": [
      "../mb.js"
    ],
    "../ma.js": [
      "../xa.js"
    ],
    "../mb.js": [
      "../xb.js"
    ],
    "../xa.js": [
      "../mb.js"
    ],
    "../xb.js": [
      "../ma.js"
    ]
  },
  "semanticDiagnosticsPerFile": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "size": 2781
}
//// [/home/src/workspaces/project/out/xa.d.ts] *new* 
export = o;
declare const o: any;

//// [/home/src/workspaces/project/out/xa.js] *new* 
"use strict";
/** @type {typeof import("./mb")} */
const M = /** @type {any} */ (null);
const o = { v: { ...M } };
module.exports = o;

//// [/home/src/workspaces/project/out/xb.d.ts] *new* 
export = o;
declare const o: any;

//// [/home/src/workspaces/project/out/xb.js] *new* 
"use strict";
/** @type {typeof import("./ma")} */
const M = /** @type {any} */ (null);
const o = { v: { ...M } };
module.exports = o;


tsconfig.json::
SemanticDiagnostics::
*not cached* /home/src/tslibs/TS/Lib/lib.es2026.full.d.ts
*not cached* /home/src/workspaces/project/xb.js
*not cached* /home/src/workspaces/project/mb.js
*not cached* /home/src/workspaces/project/xa.js
*not cached* /home/src/workspaces/project/ma.js
*not cached* /home/src/workspaces/project/a.ts
*not cached* /home/src/workspaces/project/b.ts
*not cached* /home/src/workspaces/project/c.ts
Signatures::
(stored at emit) /home/src/workspaces/project/xb.js
(stored at emit) /home/src/workspaces/project/mb.js
(stored at emit) /home/src/workspaces/project/xa.js
(stored at emit) /home/src/workspaces/project/ma.js
(stored at emit) /home/src/workspaces/project/a.ts
(stored at emit) /home/src/workspaces/project/b.ts
(stored at emit) /home/src/workspaces/project/c.ts


Edit [0]:: change exports of ma
//// [/home/src/workspaces/project/ma.js] *modified* 
export { v as pa } from "./xa";
export const ma = 1;export const ma2 = 2;


tsgo --singleThreaded
ExitStatus:: Success
Output::
//// [/home/src/workspaces/project/out/a.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/a.js] *rewrite with same content*
//// [/home/src/workspaces/project/out/b.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/ma.d.ts] *modified* 
export { v as pa } from "./xa";
export declare const ma = 1;
export declare const ma2 = 2;

//// [/home/src/workspaces/project/out/ma.js] *modified* 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ma2 = exports.ma = exports.pa = void 0;
var xa_1 = require("./xa");
Object.defineProperty(exports, "pa", { enumerable: true, get: function () { return xa_1.v; } });
exports.ma = 1;
exports.ma2 = 2;

//// [/home/src/workspaces/project/out/mb.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo] *modified* 
{"version":"FakeTSVersion","checkPending":true,"root":[[2,8]],"fileNames":["lib.es2026.full.d.ts","../xb.js","../mb.js","../xa.js","../ma.js","../a.ts","../b.ts","../c.ts"],"fileInfos":[{"version":"8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };","affectsGlobalScope":true,"impliedNodeFormat":1},{"version":"6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;","signature":"978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n","impliedNodeFormat":1},{"version":"4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n","signature":"5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n","impliedNodeFormat":1},{"version":"8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;","signature":"1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n","impliedNodeFormat":1},{"version":"d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;","signature":"b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n","impliedNodeFormat":1},{"version":"da771f73da4798394bcb22005e5008d1-export const c = 1;","signature":"ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n","impliedNodeFormat":1}],"fileIdsList":[[5],[3],[4],[2]],"options":{"allowJs":true,"declaration":true,"module":1,"outDir":"./"},"referencedMap":[[6,1],[7,2],[5,3],[3,4],[4,2],[2,1]],"semanticDiagnosticsPerFile":[1,2,3,4,5,6,7,8]}
//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo.readable.baseline.txt] *modified* 
{
  "version": "FakeTSVersion",
  "checkPending": true,
  "root": [
    {
      "files": [
        "../xb.js",
        "../mb.js",
        "../xa.js",
        "../ma.js",
        "../a.ts",
        "../b.ts",
        "../c.ts"
      ],
      "original": [
        2,
        8
      ]
    }
  ],
  "fileNames": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "fileInfos": [
    {
      "fileName": "lib.es2026.full.d.ts",
      "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "signature": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "affectsGlobalScope": true,
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true,
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xb.js",
      "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../mb.js",
      "version": "4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;",
      "signature": "978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "4399f651f6b66c23be86734e9998b6b1-export { v as pb } from \"./xb\";\nexport const mb = 1;",
        "signature": "978db666454f0f3cbbb18d804e79aacd-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xa.js",
      "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../ma.js",
      "version": "75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n",
      "signature": "5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n",
        "signature": "5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../a.ts",
      "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
      "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
        "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../b.ts",
      "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
      "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
        "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../c.ts",
      "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
      "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
        "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
        "impliedNodeFormat": 1
      }
    }
  ],
  "fileIdsList": [
    [
      "../ma.js"
    ],
    [
      "../mb.js"
    ],
    [
      "../xa.js"
    ],
    [
      "../xb.js"
    ]
  ],
  "options": {
    "allowJs": true,
    "declaration": true,
    "module": 1,
    "outDir": "./"
  },
  "referencedMap": {
    "../a.ts": [
      "../ma.js"
    ],
    "../b.ts": [
      "../mb.js"
    ],
    "../ma.js": [
      "../xa.js"
    ],
    "../mb.js": [
      "../xb.js"
    ],
    "../xa.js": [
      "../mb.js"
    ],
    "../xb.js": [
      "../ma.js"
    ]
  },
  "semanticDiagnosticsPerFile": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "size": 2835
}
//// [/home/src/workspaces/project/out/xa.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/xb.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/xb.js] *rewrite with same content*

tsconfig.json::
SemanticDiagnostics::
*not cached* /home/src/tslibs/TS/Lib/lib.es2026.full.d.ts
*not cached* /home/src/workspaces/project/xb.js
*not cached* /home/src/workspaces/project/mb.js
*not cached* /home/src/workspaces/project/xa.js
*not cached* /home/src/workspaces/project/ma.js
*not cached* /home/src/workspaces/project/a.ts
*not cached* /home/src/workspaces/project/b.ts
*not cached* /home/src/workspaces/project/c.ts
Signatures::
(computed .d.ts) /home/src/workspaces/project/xb.js
(stored at emit) /home/src/workspaces/project/mb.js
(stored at emit) /home/src/workspaces/project/xa.js
(computed .d.ts) /home/src/workspaces/project/ma.js
(computed .d.ts) /home/src/workspaces/project/a.ts
(stored at emit) /home/src/workspaces/project/b.ts


Diff:: The rebuild computes signatures of the changed file and the files referencing it before emitting, so the checker resolves the cyclic spreads in another order than a clean build. !!! Diff not found but explanation present, please review and remove the explanation !!!


Edit [1]:: change exports of mb
//// [/home/src/workspaces/project/mb.js] *modified* 
export { v as pb } from "./xb";
export const mb = 1;export const mb2 = 2;


tsgo --singleThreaded
ExitStatus:: Success
Output::
//// [/home/src/workspaces/project/out/a.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/b.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/b.js] *rewrite with same content*
//// [/home/src/workspaces/project/out/ma.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/mb.d.ts] *modified* 
export { v as pb } from "./xb";
export declare const mb = 1;
export declare const mb2 = 2;

//// [/home/src/workspaces/project/out/mb.js] *modified* 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mb2 = exports.mb = exports.pb = void 0;
var xb_1 = require("./xb");
Object.defineProperty(exports, "pb", { enumerable: true, get: function () { return xb_1.v; } });
exports.mb = 1;
exports.mb2 = 2;

//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo] *modified* 
{"version":"FakeTSVersion","checkPending":true,"root":[[2,8]],"fileNames":["lib.es2026.full.d.ts","../xb.js","../mb.js","../xa.js","../ma.js","../a.ts","../b.ts","../c.ts"],"fileInfos":[{"version":"8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };","affectsGlobalScope":true,"impliedNodeFormat":1},{"version":"6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"8499e5084cd18a1dd386d664696069ca-export { v as pb } from \"./xb\";\nexport const mb = 1;export const mb2 = 2;\n","signature":"44a34e5d9bdf064b420242f972725c0a-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\nexport declare const mb2 = 2;\n","impliedNodeFormat":1},{"version":"4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;","signature":"0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n","impliedNodeFormat":1},{"version":"75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n","signature":"5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n","impliedNodeFormat":1},{"version":"8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;","signature":"1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n","impliedNodeFormat":1},{"version":"d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;","signature":"b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n","impliedNodeFormat":1},{"version":"da771f73da4798394bcb22005e5008d1-export const c = 1;","signature":"ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n","impliedNodeFormat":1}],"fileIdsList":[[5],[3],[4],[2]],"options":{"allowJs":true,"declaration":true,"module":1,"outDir":"./"},"referencedMap":[[6,1],[7,2],[5,3],[3,4],[4,2],[2,1]],"semanticDiagnosticsPerFile":[1,2,3,4,5,6,7,8]}
//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo.readable.baseline.txt] *modified* 
{
  "version": "FakeTSVersion",
  "checkPending": true,
  "root": [
    {
      "files": [
        "../xb.js",
        "../mb.js",
        "../xa.js",
        "../ma.js",
        "../a.ts",
        "../b.ts",
        "../c.ts"
      ],
      "original": [
        2,
        8
      ]
    }
  ],
  "fileNames": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "fileInfos": [
    {
      "fileName": "lib.es2026.full.d.ts",
      "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "signature": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
      "affectsGlobalScope": true,
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };",
        "affectsGlobalScope": true,
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xb.js",
      "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "6e2e581790e601adf07d7ecac12a5cd4-/** @type {typeof import(\"./ma\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../mb.js",
      "version": "8499e5084cd18a1dd386d664696069ca-export { v as pb } from \"./xb\";\nexport const mb = 1;export const mb2 = 2;\n",
      "signature": "44a34e5d9bdf064b420242f972725c0a-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\nexport declare const mb2 = 2;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8499e5084cd18a1dd386d664696069ca-export { v as pb } from \"./xb\";\nexport const mb = 1;export const mb2 = 2;\n",
        "signature": "44a34e5d9bdf064b420242f972725c0a-export { v as pb } from \"./xb\";\nexport declare const mb = 1;\nexport declare const mb2 = 2;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../xa.js",
      "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
      "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "4e362db9a56281a363586b0e5b397c7f-/** @type {typeof import(\"./mb\")} */\nconst M = /** @type {any} */ (null);\nconst o = { v: { ...M } };\nmodule.exports = o;",
        "signature": "0f171af151cfcaa3cb254bd948318cf6-export = o;\ndeclare const o: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../ma.js",
      "version": "75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n",
      "signature": "5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "75534a8a0d2a4c73e92e89c7bf47baf6-export { v as pa } from \"./xa\";\nexport const ma = 1;export const ma2 = 2;\n",
        "signature": "5c7320733540bb7df8905315038a566d-export { v as pa } from \"./xa\";\nexport declare const ma = 1;\nexport declare const ma2 = 2;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../a.ts",
      "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
      "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "8c3afeccf0d0ef3fa64bdc2f45cef08c-import * as MA from \"./ma\";\nexport const fromA = MA.pa;",
        "signature": "1f3aa08f309a0fddec1d016112e0625a-export declare const fromA: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../b.ts",
      "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
      "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "d53e85bf6f340fc84e7261d3f85f4170-import * as MB from \"./mb\";\nexport const fromB = MB.pb;",
        "signature": "b4bc3150ee2f0ace52f5d7686f10de28-export declare const fromB: any;\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../c.ts",
      "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
      "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "da771f73da4798394bcb22005e5008d1-export const c = 1;",
        "signature": "ad1712143f62800e84506bb2608c36fe-export declare const c = 1;\n",
        "impliedNodeFormat": 1
      }
    }
  ],
  "fileIdsList": [
    [
      "../ma.js"
    ],
    [
      "../mb.js"
    ],
    [
      "../xa.js"
    ],
    [
      "../xb.js"
    ]
  ],
  "options": {
    "allowJs": true,
    "declaration": true,
    "module": 1,
    "outDir": "./"
  },
  "referencedMap": {
    "../a.ts": [
      "../ma.js"
    ],
    "../b.ts": [
      "../mb.js"
    ],
    "../ma.js": [
      "../xa.js"
    ],
    "../mb.js": [
      "../xb.js"
    ],
    "../xa.js": [
      "../mb.js"
    ],
    "../xb.js": [
      "../ma.js"
    ]
  },
  "semanticDiagnosticsPerFile": [
    "lib.es2026.full.d.ts",
    "../xb.js",
    "../mb.js",
    "../xa.js",
    "../ma.js",
    "../a.ts",
    "../b.ts",
    "../c.ts"
  ],
  "size": 2889
}
//// [/home/src/workspaces/project/out/xa.d.ts] *rewrite with same content*
//// [/home/src/workspaces/project/out/xa.js] *rewrite with same content*
//// [/home/src/workspaces/project/out/xb.d.ts] *rewrite with same content*

tsconfig.json::
SemanticDiagnostics::
*not cached* /home/src/tslibs/TS/Lib/lib.es2026.full.d.ts
*not cached* /home/src/workspaces/project/xb.js
*not cached* /home/src/workspaces/project/mb.js
*not cached* /home/src/workspaces/project/xa.js
*not cached* /home/src/workspaces/project/ma.js
*not cached* /home/src/workspaces/project/a.ts
*not cached* /home/src/workspaces/project/b.ts
*not cached* /home/src/workspaces/project/c.ts
Signatures::
(stored at emit) /home/src/workspaces/project/xb.js
(computed .d.ts) /home/src/workspaces/project/mb.js
(computed .d.ts) /home/src/workspaces/project/xa.js
(stored at emit) /home/src/workspaces/project/ma.js
(stored at emit) /home/src/workspaces/project/a.ts
(computed .d.ts) /home/src/workspaces/project/b.ts


Diff:: The rebuild computes signatures of the changed file and the files referencing it before emitting, so the checker resolves the cyclic spreads in another order than a clean build. !!! Diff not found but explanation present, please review and remove the explanation !!!
