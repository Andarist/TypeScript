currentDirectory::/home/src/workspaces/project
useCaseSensitiveFileNames::true
Input::
//// [/home/src/workspaces/project/effect.ts] *new* 
import { some } from "./option";
import { right } from "./either";
export function succeed<A>(value: A) {
    return { option: some(value), either: right(value) };
}
//// [/home/src/workspaces/project/either.ts] *new* 
export function right<R>(right: R) {
    return { _tag: "Right" as const, right };
}
export function left<L>(left: L) {
    return { _tag: "Left" as const, left };
}
//// [/home/src/workspaces/project/option.ts] *new* 
export function some<T>(value: T) {
    return { _tag: "Some" as const, value };
}
export function none() {
    return { _tag: "None" as const };
}
//// [/home/src/workspaces/project/schedule.ts] *new* 
import { left } from "./either";
export const fail = <E>(error: E) => ({ attempts: 1, last: left(error) });
//// [/home/src/workspaces/project/stream.ts] *new* 
import { succeed } from "./effect";
import { none } from "./option";
export const fromValue = <A>(value: A) => [succeed(value), none()] as const;
//// [/home/src/workspaces/project/tsconfig.json] *new* 
{
    "compilerOptions": {
        "incremental": true,
        "declaration": true,
        "downlevelIteration": true,
        "outDir": "out",
        "types": []
    }
}

tsgo --generateTrace /home/src/workspaces/project/trace --singleThreaded
ExitStatus:: DiagnosticsPresent_OutputsGenerated
Output::
[96mtsconfig.json[0m:[93m5[0m:[93m9[0m - [91merror[0m[90m TS5102: [0mOption 'downlevelIteration' has been removed. Please remove it from your configuration.

[7m5[0m         "downlevelIteration": true,
[7m [0m [91m        ~~~~~~~~~~~~~~~~~~~~[0m


Found 1 error in tsconfig.json[90m:5[0m

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
//// [/home/src/workspaces/project/out/effect.d.ts] *new* 
export declare function succeed<A>(value: A): {
    option: {
        _tag: "Some";
        value: A;
    };
    either: {
        _tag: "Right";
        right: A;
    };
};

//// [/home/src/workspaces/project/out/effect.js] *new* 
import { some } from "./option";
import { right } from "./either";
export function succeed(value) {
    return { option: some(value), either: right(value) };
}

//// [/home/src/workspaces/project/out/either.d.ts] *new* 
export declare function right<R>(right: R): {
    _tag: "Right";
    right: R;
};
export declare function left<L>(left: L): {
    _tag: "Left";
    left: L;
};

//// [/home/src/workspaces/project/out/either.js] *new* 
export function right(right) {
    return { _tag: "Right", right };
}
export function left(left) {
    return { _tag: "Left", left };
}

//// [/home/src/workspaces/project/out/option.d.ts] *new* 
export declare function some<T>(value: T): {
    _tag: "Some";
    value: T;
};
export declare function none(): {
    _tag: "None";
};

//// [/home/src/workspaces/project/out/option.js] *new* 
export function some(value) {
    return { _tag: "Some", value };
}
export function none() {
    return { _tag: "None" };
}

//// [/home/src/workspaces/project/out/schedule.d.ts] *new* 
export declare const fail: <E>(error: E) => {
    attempts: number;
    last: {
        _tag: "Left";
        left: E;
    };
};

//// [/home/src/workspaces/project/out/schedule.js] *new* 
import { left } from "./either";
export const fail = (error) => ({ attempts: 1, last: left(error) });

//// [/home/src/workspaces/project/out/stream.d.ts] *new* 
export declare const fromValue: <A>(value: A) => readonly [{
    option: {
        _tag: "Some";
        value: A;
    };
    either: {
        _tag: "Right";
        right: A;
    };
}, {
    _tag: "None";
}];

//// [/home/src/workspaces/project/out/stream.js] *new* 
import { succeed } from "./effect";
import { none } from "./option";
export const fromValue = (value) => [succeed(value), none()];

//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo] *new* 
{"version":"FakeTSVersion","errors":true,"root":[[2,6]],"fileNames":["lib.es2026.full.d.ts","../option.ts","../either.ts","../effect.ts","../schedule.ts","../stream.ts"],"fileInfos":[{"version":"8859c12c614ce56ba9a18e58384a198f-/// <reference no-default-lib=\"true\"/>\ninterface Boolean {}\ninterface Function {}\ninterface CallableFunction {}\ninterface NewableFunction {}\ninterface IArguments {}\ninterface Number { toExponential: any; }\ninterface Object {}\ninterface RegExp {}\ninterface String { charAt: any; }\ninterface Array<T> { length: number; [n: number]: T; }\ninterface ReadonlyArray<T> {}\ninterface SymbolConstructor {\n    (desc?: string | number): symbol;\n    for(name: string): symbol;\n    readonly toStringTag: symbol;\n}\ndeclare var Symbol: SymbolConstructor;\ninterface Symbol {\n    readonly [Symbol.toStringTag]: string;\n}\ndeclare const console: { log(msg: any): void; };","affectsGlobalScope":true,"impliedNodeFormat":1},{"version":"e3c1ce37a603e1674f61262fef017e3b-export function some<T>(value: T) {\n    return { _tag: \"Some\" as const, value };\n}\nexport function none() {\n    return { _tag: \"None\" as const };\n}","signature":"32e3ed0a9fb61528cac321784f794438-export declare function some<T>(value: T): {\n    _tag: \"Some\";\n    value: T;\n};\nexport declare function none(): {\n    _tag: \"None\";\n};\n","impliedNodeFormat":1},{"version":"600e6e6edc73371c7cd638295b2a70b5-export function right<R>(right: R) {\n    return { _tag: \"Right\" as const, right };\n}\nexport function left<L>(left: L) {\n    return { _tag: \"Left\" as const, left };\n}","signature":"655658c8b7041a161d3fc73f93cce009-export declare function right<R>(right: R): {\n    _tag: \"Right\";\n    right: R;\n};\nexport declare function left<L>(left: L): {\n    _tag: \"Left\";\n    left: L;\n};\n","impliedNodeFormat":1},{"version":"332bdfb9b0251fbcbd022251ec10fe02-import { some } from \"./option\";\nimport { right } from \"./either\";\nexport function succeed<A>(value: A) {\n    return { option: some(value), either: right(value) };\n}","signature":"a5b61ce55160540d0fdfbdd4e7c97dd0-export declare function succeed<A>(value: A): {\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n};\n","impliedNodeFormat":1},{"version":"9cab48bca1d064ec83490d61194ebbbb-import { left } from \"./either\";\nexport const fail = <E>(error: E) => ({ attempts: 1, last: left(error) });","signature":"25f181201e289ca4070fa7703b287b91-export declare const fail: <E>(error: E) => {\n    attempts: number;\n    last: {\n        _tag: \"Left\";\n        left: E;\n    };\n};\n","impliedNodeFormat":1},{"version":"b0c42ca73f5e6afcc19949897557385f-import { succeed } from \"./effect\";\nimport { none } from \"./option\";\nexport const fromValue = <A>(value: A) => [succeed(value), none()] as const;","signature":"9ad60cc6fe6cfd2aa58b6eeddedd2e1f-export declare const fromValue: <A>(value: A) => readonly [{\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n}, {\n    _tag: \"None\";\n}];\n","impliedNodeFormat":1}],"fileIdsList":[[2,3],[3],[2,4]],"options":{"declaration":true,"outDir":"./","downlevelIteration":true},"referencedMap":[[4,1],[5,2],[6,3]],"semanticDiagnosticsPerFile":[1,2,3,4,5,6]}
//// [/home/src/workspaces/project/out/tsconfig.tsbuildinfo.readable.baseline.txt] *new* 
{
  "version": "FakeTSVersion",
  "errors": true,
  "root": [
    {
      "files": [
        "../option.ts",
        "../either.ts",
        "../effect.ts",
        "../schedule.ts",
        "../stream.ts"
      ],
      "original": [
        2,
        6
      ]
    }
  ],
  "fileNames": [
    "lib.es2026.full.d.ts",
    "../option.ts",
    "../either.ts",
    "../effect.ts",
    "../schedule.ts",
    "../stream.ts"
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
      "fileName": "../option.ts",
      "version": "e3c1ce37a603e1674f61262fef017e3b-export function some<T>(value: T) {\n    return { _tag: \"Some\" as const, value };\n}\nexport function none() {\n    return { _tag: \"None\" as const };\n}",
      "signature": "32e3ed0a9fb61528cac321784f794438-export declare function some<T>(value: T): {\n    _tag: \"Some\";\n    value: T;\n};\nexport declare function none(): {\n    _tag: \"None\";\n};\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "e3c1ce37a603e1674f61262fef017e3b-export function some<T>(value: T) {\n    return { _tag: \"Some\" as const, value };\n}\nexport function none() {\n    return { _tag: \"None\" as const };\n}",
        "signature": "32e3ed0a9fb61528cac321784f794438-export declare function some<T>(value: T): {\n    _tag: \"Some\";\n    value: T;\n};\nexport declare function none(): {\n    _tag: \"None\";\n};\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../either.ts",
      "version": "600e6e6edc73371c7cd638295b2a70b5-export function right<R>(right: R) {\n    return { _tag: \"Right\" as const, right };\n}\nexport function left<L>(left: L) {\n    return { _tag: \"Left\" as const, left };\n}",
      "signature": "655658c8b7041a161d3fc73f93cce009-export declare function right<R>(right: R): {\n    _tag: \"Right\";\n    right: R;\n};\nexport declare function left<L>(left: L): {\n    _tag: \"Left\";\n    left: L;\n};\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "600e6e6edc73371c7cd638295b2a70b5-export function right<R>(right: R) {\n    return { _tag: \"Right\" as const, right };\n}\nexport function left<L>(left: L) {\n    return { _tag: \"Left\" as const, left };\n}",
        "signature": "655658c8b7041a161d3fc73f93cce009-export declare function right<R>(right: R): {\n    _tag: \"Right\";\n    right: R;\n};\nexport declare function left<L>(left: L): {\n    _tag: \"Left\";\n    left: L;\n};\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../effect.ts",
      "version": "332bdfb9b0251fbcbd022251ec10fe02-import { some } from \"./option\";\nimport { right } from \"./either\";\nexport function succeed<A>(value: A) {\n    return { option: some(value), either: right(value) };\n}",
      "signature": "a5b61ce55160540d0fdfbdd4e7c97dd0-export declare function succeed<A>(value: A): {\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n};\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "332bdfb9b0251fbcbd022251ec10fe02-import { some } from \"./option\";\nimport { right } from \"./either\";\nexport function succeed<A>(value: A) {\n    return { option: some(value), either: right(value) };\n}",
        "signature": "a5b61ce55160540d0fdfbdd4e7c97dd0-export declare function succeed<A>(value: A): {\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n};\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../schedule.ts",
      "version": "9cab48bca1d064ec83490d61194ebbbb-import { left } from \"./either\";\nexport const fail = <E>(error: E) => ({ attempts: 1, last: left(error) });",
      "signature": "25f181201e289ca4070fa7703b287b91-export declare const fail: <E>(error: E) => {\n    attempts: number;\n    last: {\n        _tag: \"Left\";\n        left: E;\n    };\n};\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "9cab48bca1d064ec83490d61194ebbbb-import { left } from \"./either\";\nexport const fail = <E>(error: E) => ({ attempts: 1, last: left(error) });",
        "signature": "25f181201e289ca4070fa7703b287b91-export declare const fail: <E>(error: E) => {\n    attempts: number;\n    last: {\n        _tag: \"Left\";\n        left: E;\n    };\n};\n",
        "impliedNodeFormat": 1
      }
    },
    {
      "fileName": "../stream.ts",
      "version": "b0c42ca73f5e6afcc19949897557385f-import { succeed } from \"./effect\";\nimport { none } from \"./option\";\nexport const fromValue = <A>(value: A) => [succeed(value), none()] as const;",
      "signature": "9ad60cc6fe6cfd2aa58b6eeddedd2e1f-export declare const fromValue: <A>(value: A) => readonly [{\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n}, {\n    _tag: \"None\";\n}];\n",
      "impliedNodeFormat": "CommonJS",
      "original": {
        "version": "b0c42ca73f5e6afcc19949897557385f-import { succeed } from \"./effect\";\nimport { none } from \"./option\";\nexport const fromValue = <A>(value: A) => [succeed(value), none()] as const;",
        "signature": "9ad60cc6fe6cfd2aa58b6eeddedd2e1f-export declare const fromValue: <A>(value: A) => readonly [{\n    option: {\n        _tag: \"Some\";\n        value: A;\n    };\n    either: {\n        _tag: \"Right\";\n        right: A;\n    };\n}, {\n    _tag: \"None\";\n}];\n",
        "impliedNodeFormat": 1
      }
    }
  ],
  "fileIdsList": [
    [
      "../option.ts",
      "../either.ts"
    ],
    [
      "../either.ts"
    ],
    [
      "../option.ts",
      "../effect.ts"
    ]
  ],
  "options": {
    "declaration": true,
    "outDir": "./",
    "downlevelIteration": true
  },
  "referencedMap": {
    "../effect.ts": [
      "../option.ts",
      "../either.ts"
    ],
    "../schedule.ts": [
      "../either.ts"
    ],
    "../stream.ts": [
      "../option.ts",
      "../effect.ts"
    ]
  },
  "semanticDiagnosticsPerFile": [
    "lib.es2026.full.d.ts",
    "../option.ts",
    "../either.ts",
    "../effect.ts",
    "../schedule.ts",
    "../stream.ts"
  ],
  "size": 3363
}
//// [/home/src/workspaces/project/trace/legend.json] *new* 
[
  {
    "configFilePath": "/home/src/workspaces/project/tsconfig.json",
    "tracePath": "/home/src/workspaces/project/trace/trace.json",
    "typesPath": "/home/src/workspaces/project/trace/types_0.json",
    "checkerId": 0
  }
]
//// [/home/src/workspaces/project/trace/trace.json] *new* 
[
{"pid":1,"tid":1,"ph":"M","cat":"__metadata","ts":1,"name":"process_name","args":{"name":"tsgo"}},
{"pid":1,"tid":1,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"Main"}},
{"pid":1,"tid":1,"ph":"M","cat":"disabled-by-default-devtools.timeline","ts":1,"name":"TracingStartedInBrowser"},
{"pid":1,"tid":1,"ph":"B","cat":"program","ts":2,"name":"createProgram","args":{"configFilePath":"/home/src/workspaces/project/tsconfig.json"}},
{"pid":1,"tid":181085097,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts"}},
{"pid":1,"tid":181085097,"ph":"B","cat":"parse","ts":3,"name":"createSourceFile","args":{"path":"/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts"}},
{"pid":1,"tid":181085097,"ph":"E","cat":"parse","ts":4,"name":"createSourceFile","args":{"path":"/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts"}},
{"pid":1,"tid":527232103,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/workspaces/project/stream.ts"}},
{"pid":1,"tid":527232103,"ph":"B","cat":"parse","ts":5,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/stream.ts"}},
{"pid":1,"tid":527232103,"ph":"E","cat":"parse","ts":6,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/stream.ts"}},
{"pid":1,"tid":88248816,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":88248816,"ph":"B","cat":"parse","ts":7,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":88248816,"ph":"E","cat":"parse","ts":8,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":470270829,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":470270829,"ph":"B","cat":"parse","ts":9,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":470270829,"ph":"E","cat":"parse","ts":10,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":583873833,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":583873833,"ph":"B","cat":"parse","ts":11,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":583873833,"ph":"E","cat":"parse","ts":12,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":714242023,"ph":"M","cat":"__metadata","ts":1,"name":"thread_name","args":{"name":"file:/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":714242023,"ph":"B","cat":"parse","ts":13,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":714242023,"ph":"E","cat":"parse","ts":14,"name":"createSourceFile","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"program","ts":15,"name":"createProgram","args":{"configFilePath":"/home/src/workspaces/project/tsconfig.json"}},
{"pid":1,"tid":714242023,"ph":"B","cat":"bind","ts":16,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":714242023,"ph":"E","cat":"bind","ts":17,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":470270829,"ph":"B","cat":"bind","ts":18,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":470270829,"ph":"E","cat":"bind","ts":19,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":583873833,"ph":"B","cat":"bind","ts":20,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":583873833,"ph":"E","cat":"bind","ts":21,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":88248816,"ph":"B","cat":"bind","ts":22,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":88248816,"ph":"E","cat":"bind","ts":23,"name":"bindSourceFile","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":181085097,"ph":"B","cat":"bind","ts":24,"name":"bindSourceFile","args":{"path":"/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts"}},
{"pid":1,"tid":181085097,"ph":"E","cat":"bind","ts":25,"name":"bindSourceFile","args":{"path":"/home/src/tslibs/TS/Lib/lib.es2026.full.d.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"bind","ts":26,"name":"bindSourceFiles"},
{"pid":1,"tid":1,"ph":"E","cat":"bind","ts":27,"name":"bindSourceFiles"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":28,"name":"emit"},
{"pid":1,"tid":88248816,"ph":"B","cat":"emit","ts":29,"name":"emit","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":30,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/option.js"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":31,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/option.js"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":32,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/option.d.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":33,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/option.d.ts"}},
{"pid":1,"tid":88248816,"ph":"E","cat":"emit","ts":34,"name":"emit","args":{"path":"/home/src/workspaces/project/option.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":35,"name":"emit"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":36,"name":"emit"},
{"pid":1,"tid":714242023,"ph":"B","cat":"emit","ts":37,"name":"emit","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":38,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/schedule.js"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":39,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/schedule.js"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":40,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/schedule.d.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":41,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/schedule.d.ts"}},
{"pid":1,"tid":714242023,"ph":"E","cat":"emit","ts":42,"name":"emit","args":{"path":"/home/src/workspaces/project/schedule.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":43,"name":"emit"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":44,"name":"emit"},
{"pid":1,"tid":470270829,"ph":"B","cat":"emit","ts":45,"name":"emit","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":46,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/effect.js"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":47,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/effect.js"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":48,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/effect.d.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":49,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/effect.d.ts"}},
{"pid":1,"tid":470270829,"ph":"E","cat":"emit","ts":50,"name":"emit","args":{"path":"/home/src/workspaces/project/effect.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":51,"name":"emit"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":52,"name":"emit"},
{"pid":1,"tid":527232103,"ph":"B","cat":"emit","ts":53,"name":"emit","args":{"path":"/home/src/workspaces/project/stream.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":54,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/stream.js"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":55,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/stream.js"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":56,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/stream.d.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":57,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/stream.d.ts"}},
{"pid":1,"tid":527232103,"ph":"E","cat":"emit","ts":58,"name":"emit","args":{"path":"/home/src/workspaces/project/stream.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":59,"name":"emit"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":60,"name":"emit"},
{"pid":1,"tid":583873833,"ph":"B","cat":"emit","ts":61,"name":"emit","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":62,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/either.js"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":63,"name":"emitJsFileOrBundle","args":{"jsFilePath":"/home/src/workspaces/project/out/either.js"}},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":64,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/either.d.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":65,"name":"emitDeclarationFileOrBundle","args":{"declarationFilePath":"/home/src/workspaces/project/out/either.d.ts"}},
{"pid":1,"tid":583873833,"ph":"E","cat":"emit","ts":66,"name":"emit","args":{"path":"/home/src/workspaces/project/either.ts"}},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":67,"name":"emit"},
{"pid":1,"tid":1,"ph":"B","cat":"emit","ts":68,"name":"emitBuildInfo"},
{"pid":1,"tid":1,"ph":"E","cat":"emit","ts":69,"name":"emitBuildInfo"}
]

//// [/home/src/workspaces/project/trace/types_0.json] *new* 
[{"id":1,"intrinsicName":"any","recursionId":0,"flags":["Any"]},
{"id":2,"intrinsicName":"any","recursionId":1,"flags":["Any"]},
{"id":3,"intrinsicName":"any","recursionId":2,"flags":["Any"]},
{"id":4,"intrinsicName":"any","recursionId":3,"flags":["Any"]},
{"id":5,"intrinsicName":"error","recursionId":4,"flags":["Any"]},
{"id":6,"intrinsicName":"unresolved","recursionId":5,"flags":["Any"]},
{"id":7,"intrinsicName":"any","recursionId":6,"flags":["Any"]},
{"id":8,"intrinsicName":"intrinsic","recursionId":7,"flags":["Any"]},
{"id":9,"intrinsicName":"unknown","recursionId":8,"flags":["Unknown"]},
{"id":10,"intrinsicName":"undefined","recursionId":9,"flags":["Undefined"]},
{"id":11,"intrinsicName":"undefined","recursionId":10,"flags":["Undefined"]},
{"id":12,"intrinsicName":"undefined","recursionId":11,"flags":["Undefined"]},
{"id":13,"intrinsicName":"null","recursionId":12,"flags":["Null"]},
{"id":14,"intrinsicName":"string","recursionId":13,"flags":["String"]},
{"id":15,"intrinsicName":"number","recursionId":14,"flags":["Number"]},
{"id":16,"intrinsicName":"bigint","recursionId":15,"flags":["BigInt"]},
{"id":17,"recursionId":16,"flags":["BooleanLiteral"],"display":"false"},
{"id":18,"recursionId":17,"flags":["BooleanLiteral"],"display":"false"},
{"id":19,"recursionId":18,"flags":["BooleanLiteral"],"display":"true"},
{"id":20,"recursionId":19,"flags":["BooleanLiteral"],"display":"true"},
{"id":21,"recursionId":20,"unionTypes":[17,19],"flags":["Boolean","Union"],"display":"boolean"},
{"id":22,"intrinsicName":"symbol","recursionId":21,"flags":["ESSymbol"]},
{"id":23,"intrinsicName":"void","recursionId":22,"flags":["Void"]},
{"id":24,"intrinsicName":"never","recursionId":23,"flags":["Never"]},
{"id":25,"intrinsicName":"never","recursionId":24,"flags":["Never"]},
{"id":26,"intrinsicName":"never","recursionId":25,"flags":["Never"]},
{"id":27,"intrinsicName":"never","recursionId":26,"flags":["Never"]},
{"id":28,"intrinsicName":"object","recursionId":27,"flags":["NonPrimitive"]},
{"id":29,"recursionId":28,"unionTypes":[14,15],"flags":["Union"],"display":"string | number"},
{"id":30,"recursionId":29,"unionTypes":[14,15,22],"flags":["Union"],"display":"string | number | symbol"},
{"id":31,"recursionId":30,"unionTypes":[15,16],"flags":["Union"],"display":"number | bigint"},
{"id":32,"recursionId":31,"flags":["TemplateLiteral"],"display":"`${number}`"},
{"id":33,"recursionId":32,"unionTypes":[10,13,14,15,16,17,19],"flags":["Union"],"display":"string | number | bigint | boolean | null | undefined"},
{"id":34,"intrinsicName":"never","recursionId":33,"flags":["Never"]},
{"id":35,"recursionId":34,"flags":["Object"],"display":"{}"},
{"id":36,"recursionId":35,"flags":["Object"],"display":"{}"},
{"id":37,"recursionId":36,"flags":["Object"],"display":"{}"},
{"id":38,"symbolName":"__type","recursionId":37,"flags":["Object"],"display":"{}"},
{"id":39,"recursionId":38,"flags":["Object"],"display":"{}"},
{"id":40,"recursionId":39,"unionTypes":[10,13,39],"flags":["Union"],"display":"{} | null | undefined"},
{"id":41,"recursionId":40,"flags":["Object"],"display":"{}"},
{"id":42,"recursionId":41,"flags":["Object"],"display":"{}"},
{"id":43,"recursionId":42,"flags":["Object"],"display":"{}"},
{"id":44,"recursionId":43,"flags":["Object"],"display":"{}"},
{"id":45,"recursionId":44,"flags":["Object"],"display":"{}"},
{"id":46,"recursionId":45,"flags":["TypeParameter"]},
{"id":47,"recursionId":46,"flags":["TypeParameter"]},
{"id":48,"recursionId":47,"flags":["TypeParameter"]},
{"id":49,"recursionId":48,"flags":["TypeParameter"]},
{"id":50,"recursionId":49,"flags":["TypeParameter"]},
{"id":51,"recursionId":50,"flags":["StringLiteral"],"display":"\"\""},
{"id":52,"recursionId":51,"flags":["NumberLiteral"],"display":"0"},
{"id":53,"recursionId":52,"flags":["BigIntLiteral"],"display":"0n"},
{"id":54,"recursionId":53,"flags":["StringLiteral"],"display":"\"bigint\""},
{"id":55,"recursionId":54,"flags":["StringLiteral"],"display":"\"boolean\""},
{"id":56,"recursionId":55,"flags":["StringLiteral"],"display":"\"function\""},
{"id":57,"recursionId":56,"flags":["StringLiteral"],"display":"\"number\""},
{"id":58,"recursionId":57,"flags":["StringLiteral"],"display":"\"object\""},
{"id":59,"recursionId":58,"flags":["StringLiteral"],"display":"\"string\""},
{"id":60,"recursionId":59,"flags":["StringLiteral"],"display":"\"symbol\""},
{"id":61,"recursionId":60,"flags":["StringLiteral"],"display":"\"undefined\""},
{"id":62,"recursionId":61,"unionTypes":[54,55,56,57,58,59,60,61],"flags":["Union"],"display":"\"bigint\" | \"boolean\" | \"function\" | \"number\" | \"object\" | \"string\" | \"symbol\" | \"undefined\""},
{"id":63,"symbolName":"IArguments","recursionId":62,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":6,"character":1},"end":{"line":6,"character":24}},"flags":["Object"]},
{"id":64,"symbolName":"globalThis","recursionId":63,"flags":["Object"],"display":"typeof globalThis"},
{"id":65,"symbolName":"Array","recursionId":64,"instantiatedType":65,"typeArguments":[66],"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":11,"character":1},"end":{"line":11,"character":55}},"flags":["Object"]},
{"id":66,"symbolName":"T","recursionId":65,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":11,"character":17},"end":{"line":11,"character":18}},"flags":["TypeParameter"]},
{"id":67,"symbolName":"Array","recursionId":64,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":11,"character":1},"end":{"line":11,"character":55}},"flags":["TypeParameter"]},
{"id":68,"symbolName":"Object","recursionId":66,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":8,"character":1},"end":{"line":8,"character":20}},"flags":["Object"]},
{"id":69,"symbolName":"Function","recursionId":67,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":3,"character":1},"end":{"line":3,"character":22}},"flags":["Object"]},
{"id":70,"symbolName":"CallableFunction","recursionId":68,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":4,"character":1},"end":{"line":4,"character":30}},"flags":["Object"]},
{"id":71,"symbolName":"NewableFunction","recursionId":69,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":5,"character":1},"end":{"line":5,"character":29}},"flags":["Object"]},
{"id":72,"symbolName":"String","recursionId":70,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":10,"character":1},"end":{"line":10,"character":34}},"flags":["Object"]},
{"id":73,"symbolName":"Number","recursionId":71,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":7,"character":1},"end":{"line":7,"character":41}},"flags":["Object"]},
{"id":74,"symbolName":"Boolean","recursionId":72,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":2,"character":1},"end":{"line":2,"character":21}},"flags":["Object"]},
{"id":75,"symbolName":"RegExp","recursionId":73,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":9,"character":1},"end":{"line":9,"character":20}},"flags":["Object"]},
{"id":76,"symbolName":"Array","recursionId":64,"instantiatedType":65,"typeArguments":[1],"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":11,"character":1},"end":{"line":11,"character":55}},"flags":["Object"]},
{"id":77,"symbolName":"Array","recursionId":64,"instantiatedType":65,"typeArguments":[2],"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":11,"character":1},"end":{"line":11,"character":55}},"flags":["Object"]},
{"id":78,"symbolName":"ReadonlyArray","recursionId":74,"instantiatedType":78,"typeArguments":[79],"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":12,"character":1},"end":{"line":12,"character":30}},"flags":["Object"]},
{"id":79,"symbolName":"T","recursionId":75,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":12,"character":25},"end":{"line":12,"character":26}},"flags":["TypeParameter"]},
{"id":80,"symbolName":"ReadonlyArray","recursionId":74,"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":12,"character":1},"end":{"line":12,"character":30}},"flags":["TypeParameter"]},
{"id":81,"symbolName":"ReadonlyArray","recursionId":74,"instantiatedType":78,"typeArguments":[1],"firstDeclaration":{"path":"/home/src/tslibs/ts/lib/lib.es2026.full.d.ts","start":{"line":12,"character":1},"end":{"line":12,"character":30}},"flags":["Object"]},
{"id":82,"symbolName":"T","recursionId":76,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":1,"character":22},"end":{"line":1,"character":23}},"flags":["TypeParameter"]},
{"id":83,"symbolName":"some","recursionId":77,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":1,"character":1},"end":{"line":3,"character":2}},"flags":["Object"],"display":"<T>(value: T) => { _tag: \"Some\"; value: T; }"},
{"id":84,"recursionId":78,"flags":["StringLiteral"],"display":"\"Some\""},
{"id":85,"recursionId":79,"flags":["StringLiteral"],"display":"\"Some\""},
{"id":86,"symbolName":"__object","recursionId":80,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: T; }"},
{"id":87,"symbolName":"__object","recursionId":81,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: T; }"},
{"id":88,"symbolName":"__object","recursionId":82,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: T; }"},
{"id":89,"symbolName":"__object","recursionId":81,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: T; }"},
{"id":90,"symbolName":"none","recursionId":83,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":4,"character":1},"end":{"line":6,"character":2}},"flags":["Object"],"display":"() => { _tag: \"None\"; }"},
{"id":91,"recursionId":84,"flags":["StringLiteral"],"display":"\"None\""},
{"id":92,"recursionId":85,"flags":["StringLiteral"],"display":"\"None\""},
{"id":93,"symbolName":"__object","recursionId":86,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":5,"character":12},"end":{"line":5,"character":37}},"flags":["Object"],"display":"{ _tag: \"None\"; }"},
{"id":94,"symbolName":"__object","recursionId":87,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":5,"character":12},"end":{"line":5,"character":37}},"flags":["Object"],"display":"{ _tag: \"None\"; }"},
{"id":95,"symbolName":"__function","recursionId":88,"firstDeclaration":{"path":"/home/src/workspaces/project/schedule.ts","start":{"line":2,"character":21},"end":{"line":2,"character":74}},"flags":["Object"],"display":"<E>(error: E) => { attempts: number; last: { _tag: \"Left\"; left: E; }; }"},
{"id":96,"symbolName":"E","recursionId":89,"firstDeclaration":{"path":"/home/src/workspaces/project/schedule.ts","start":{"line":2,"character":22},"end":{"line":2,"character":23}},"flags":["TypeParameter"]},
{"id":97,"recursionId":90,"flags":["NumberLiteral"],"display":"1"},
{"id":98,"recursionId":91,"flags":["NumberLiteral"],"display":"1"},
{"id":99,"symbolName":"left","recursionId":92,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":4,"character":1},"end":{"line":6,"character":2}},"flags":["Object"],"display":"<L>(left: L) => { _tag: \"Left\"; left: L; }"},
{"id":100,"symbolName":"L","recursionId":93,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":4,"character":22},"end":{"line":4,"character":23}},"flags":["TypeParameter"]},
{"id":101,"recursionId":94,"flags":["StringLiteral"],"display":"\"Left\""},
{"id":102,"recursionId":95,"flags":["StringLiteral"],"display":"\"Left\""},
{"id":103,"symbolName":"__object","recursionId":96,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":5,"character":12},"end":{"line":5,"character":43}},"flags":["Object"],"display":"{ _tag: \"Left\"; left: L; }"},
{"id":104,"symbolName":"__object","recursionId":97,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":5,"character":12},"end":{"line":5,"character":43}},"flags":["Object"],"display":"{ _tag: \"Left\"; left: L; }"},
{"id":105,"symbolName":"__object","recursionId":97,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":5,"character":12},"end":{"line":5,"character":43}},"flags":["Object"],"display":"{ _tag: \"Left\"; left: E; }"},
{"id":106,"symbolName":"__object","recursionId":98,"firstDeclaration":{"path":"/home/src/workspaces/project/schedule.ts","start":{"line":2,"character":39},"end":{"line":2,"character":73}},"flags":["Object"],"display":"{ attempts: number; last: { _tag: \"Left\"; left: E; }; }"},
{"id":107,"symbolName":"__object","recursionId":99,"firstDeclaration":{"path":"/home/src/workspaces/project/schedule.ts","start":{"line":2,"character":39},"end":{"line":2,"character":73}},"flags":["Object"],"display":"{ attempts: number; last: { _tag: \"Left\"; left: E; }; }"},
{"id":108,"symbolName":"__object","recursionId":100,"firstDeclaration":{"path":"/home/src/workspaces/project/schedule.ts","start":{"line":2,"character":39},"end":{"line":2,"character":73}},"flags":["Object"],"display":"{ attempts: number; last: { _tag: \"Left\"; left: E; }; }"},
{"id":109,"symbolName":"A","recursionId":101,"firstDeclaration":{"path":"/home/src/workspaces/project/effect.ts","start":{"line":3,"character":25},"end":{"line":3,"character":26}},"flags":["TypeParameter"]},
{"id":110,"symbolName":"succeed","recursionId":102,"firstDeclaration":{"path":"/home/src/workspaces/project/effect.ts","start":{"line":3,"character":1},"end":{"line":5,"character":2}},"flags":["Object"],"display":"<A>(value: A) => { option: { _tag: \"Some\"; value: A; }; either: { _tag: \"Right\"; right: A; }; }"},
{"id":111,"symbolName":"__object","recursionId":81,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: A; }"},
{"id":112,"symbolName":"right","recursionId":103,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":1,"character":1},"end":{"line":3,"character":2}},"flags":["Object"],"display":"<R>(right: R) => { _tag: \"Right\"; right: R; }"},
{"id":113,"symbolName":"R","recursionId":104,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":1,"character":23},"end":{"line":1,"character":24}},"flags":["TypeParameter"]},
{"id":114,"recursionId":105,"flags":["StringLiteral"],"display":"\"Right\""},
{"id":115,"recursionId":106,"flags":["StringLiteral"],"display":"\"Right\""},
{"id":116,"symbolName":"__object","recursionId":107,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: R; }"},
{"id":117,"symbolName":"__object","recursionId":108,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: R; }"},
{"id":118,"symbolName":"__object","recursionId":108,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: A; }"},
{"id":119,"symbolName":"__object","recursionId":109,"firstDeclaration":{"path":"/home/src/workspaces/project/effect.ts","start":{"line":4,"character":12},"end":{"line":4,"character":57}},"flags":["Object"],"display":"{ option: { _tag: \"Some\"; value: A; }; either: { _tag: \"Right\"; right: A; }; }"},
{"id":120,"symbolName":"__object","recursionId":110,"firstDeclaration":{"path":"/home/src/workspaces/project/effect.ts","start":{"line":4,"character":12},"end":{"line":4,"character":57}},"flags":["Object"],"display":"{ option: { _tag: \"Some\"; value: A; }; either: { _tag: \"Right\"; right: A; }; }"},
{"id":121,"symbolName":"__function","recursionId":111,"firstDeclaration":{"path":"/home/src/workspaces/project/stream.ts","start":{"line":3,"character":26},"end":{"line":3,"character":76}},"flags":["Object"],"display":"<A>(value: A) => readonly [{ option: { _tag: \"Some\"; value: A; }; either: { _tag: \"Right\"; right: A; }; }, { _tag: \"None\"; }]"},
{"id":122,"symbolName":"A","recursionId":112,"firstDeclaration":{"path":"/home/src/workspaces/project/stream.ts","start":{"line":3,"character":27},"end":{"line":3,"character":28}},"flags":["TypeParameter"]},
{"id":123,"symbolName":"__object","recursionId":110,"firstDeclaration":{"path":"/home/src/workspaces/project/effect.ts","start":{"line":4,"character":12},"end":{"line":4,"character":57}},"flags":["Object"],"display":"{ option: { _tag: \"Some\"; value: A; }; either: { _tag: \"Right\"; right: A; }; }"},
{"id":124,"recursionId":113,"flags":["TypeParameter"]},
{"id":125,"recursionId":114,"flags":["TypeParameter"]},
{"id":126,"recursionId":115,"flags":["NumberLiteral"],"display":"2"},
{"id":127,"recursionId":116,"isTuple":true,"instantiatedType":127,"typeArguments":[124,125],"flags":["Object"]},
{"id":128,"recursionId":117,"flags":["TypeParameter"]},
{"id":129,"recursionId":116,"instantiatedType":127,"typeArguments":[123,94],"flags":["Object"]},
{"id":130,"recursionId":118,"instantiatedType":127,"typeArguments":[123,94],"flags":["Object"]},
{"id":131,"symbolName":"__object","recursionId":81,"firstDeclaration":{"path":"/home/src/workspaces/project/option.ts","start":{"line":2,"character":12},"end":{"line":2,"character":44}},"flags":["Object"],"display":"{ _tag: \"Some\"; value: A; }"},
{"id":132,"symbolName":"__object","recursionId":108,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: A; }"},
{"id":133,"symbolName":"__object","recursionId":119,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: R; }"},
{"id":134,"symbolName":"__object","recursionId":108,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":2,"character":12},"end":{"line":2,"character":45}},"flags":["Object"],"display":"{ _tag: \"Right\"; right: R; }"},
{"id":135,"symbolName":"__object","recursionId":120,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":5,"character":12},"end":{"line":5,"character":43}},"flags":["Object"],"display":"{ _tag: \"Left\"; left: L; }"},
{"id":136,"symbolName":"__object","recursionId":97,"firstDeclaration":{"path":"/home/src/workspaces/project/either.ts","start":{"line":5,"character":12},"end":{"line":5,"character":43}},"flags":["Object"],"display":"{ _tag: \"Left\"; left: L; }"}]


tsconfig.json::
SemanticDiagnostics::
*not cached* /home/src/tslibs/TS/Lib/lib.es2026.full.d.ts
*not cached* /home/src/workspaces/project/option.ts
*not cached* /home/src/workspaces/project/either.ts
*not cached* /home/src/workspaces/project/effect.ts
*not cached* /home/src/workspaces/project/schedule.ts
*not cached* /home/src/workspaces/project/stream.ts
Signatures::
(stored at emit) /home/src/workspaces/project/option.ts
(stored at emit) /home/src/workspaces/project/either.ts
(stored at emit) /home/src/workspaces/project/effect.ts
(stored at emit) /home/src/workspaces/project/schedule.ts
(stored at emit) /home/src/workspaces/project/stream.ts
