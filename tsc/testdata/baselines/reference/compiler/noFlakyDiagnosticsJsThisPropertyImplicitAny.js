//// [tests/cases/compiler/noFlakyDiagnosticsJsThisPropertyImplicitAny.ts] ////

//// [a.js]
export class C {
    constructor() {
        this.x = undefined;
    }
}


//// [a.js]
export class C {
    constructor() {
        this.x = undefined;
    }
}


//// [a.d.ts]
export declare class C {
    x: any;
    constructor();
}
