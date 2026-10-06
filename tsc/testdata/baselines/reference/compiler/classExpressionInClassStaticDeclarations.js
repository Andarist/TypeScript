//// [tests/cases/compiler/classExpressionInClassStaticDeclarations.ts] ////

//// [classExpressionInClassStaticDeclarations.ts]
class C {
    static D = class extends C {};
}

//// [classExpressionInClassStaticDeclarations.js]
"use strict";
class C {
}
C.D = class extends C {
};


//// [classExpressionInClassStaticDeclarations.d.ts]
type C_recursive = {
    new (): {};
    D: C_recursive;
};
declare class C {
    static D: C_recursive;
}
