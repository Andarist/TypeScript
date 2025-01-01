//// [tests/cases/conformance/classes/mixinAccessors2.ts] ////

//// [mixinAccessors2.ts]
function mixin<T extends { new (...args: any[]): {} }>(superclass: T) {
  return class extends superclass {
    accessor name = "";
  };
}

class BaseClass {
  accessor name = "";
}

class MyClass extends mixin(BaseClass) {
  accessor name = "";
}


//// [mixinAccessors2.js]
"use strict";
function mixin(superclass) {
    return class extends superclass {
        accessor name = "";
    };
}
class BaseClass {
    accessor name = "";
}
class MyClass extends mixin(BaseClass) {
    accessor name = "";
}


//// [mixinAccessors2.d.ts]
declare function mixin<T extends {
    new (...args: any[]): {};
}>(superclass: T): {
    new (...args: any[]): {
        name: string;
    };
} & T;
declare class BaseClass {
    accessor name: string;
}
declare const MyClass_base: {
    new (...args: any[]): {
        name: string;
    };
} & typeof BaseClass;
declare class MyClass extends MyClass_base {
    accessor name: string;
}


//// [DtsFileErrors]


mixinAccessors2.d.ts(17,14): error TS2611: 'name' is defined as a property in class '{ name: string; } & BaseClass', but is overridden here in 'MyClass' as an accessor.


==== mixinAccessors2.d.ts (1 errors) ====
    declare function mixin<T extends {
        new (...args: any[]): {};
    }>(superclass: T): {
        new (...args: any[]): {
            name: string;
        };
    } & T;
    declare class BaseClass {
        accessor name: string;
    }
    declare const MyClass_base: {
        new (...args: any[]): {
            name: string;
        };
    } & typeof BaseClass;
    declare class MyClass extends MyClass_base {
        accessor name: string;
                 ~~~~
!!! error TS2611: 'name' is defined as a property in class '{ name: string; } & BaseClass', but is overridden here in 'MyClass' as an accessor.
    }
    