// @strict: true
// @target: es2015
// @lib: es2015,dom

// Repro from #59715

class Child extends HTMLElement {
    get parent() {
        const { parentElement } = this;

        if (!(parentElement instanceof Parent)) {
            return null;
        }

        return parentElement;
    }
}

class Parent extends HTMLElement {
    get parent() {
        const { parentElement } = this;

        if (!(parentElement instanceof GrandParent)) {
            return null;
        }

        return parentElement;
    }
}

class GrandParent extends HTMLElement {
    get parent() {
        const { parentElement } = this;

        if (!(parentElement instanceof GreatGrandParent)) {
            return null;
        }

        return parentElement;
    }
}

class GreatGrandParent extends HTMLElement {
    get parent() {
        return null;
    }
}

customElements.define("c-child", Child);
customElements.define("c-parent", Parent);
customElements.define("c-grand-parent", GrandParent);
customElements.define("c-great-grand-parent", GreatGrandParent);

type ParentElements = GreatGrandParent | GrandParent | Parent;

const child = new Child();

let currentParent: ParentElements | null = child.parent;
while (currentParent) {
    currentParent;
    currentParent = currentParent.parent;
}

// Minimized repro using inferred getters

class GetterEnd {
    get next() {
        return null;
    }
}

class GetterMiddle {
    get next() {
        return Math.random() ? new GetterEnd() : null;
    }
}

class GetterStart {
    get next() {
        return Math.random() ? new GetterMiddle() : null;
    }
}

type GetterNodes = GetterEnd | GetterMiddle | GetterStart;

declare const getterStart: GetterStart | null;
let getterCurrent: GetterNodes | null = getterStart;
while (getterCurrent) {
    getterCurrent;
    getterCurrent = getterCurrent.next;
}

// Minimized repro using readonly properties

class PropertyEnd {
    readonly next: null = null;
}

class PropertyMiddle {
    readonly next: PropertyEnd | null = null;
}

class PropertyStart {
    readonly next: PropertyMiddle | null = null;
}

type PropertyNodes = PropertyEnd | PropertyMiddle | PropertyStart;

declare const propertyStart: PropertyStart | null;
let propertyCurrent: PropertyNodes | null = propertyStart;
while (propertyCurrent) {
    propertyCurrent;
    propertyCurrent = propertyCurrent.next;
}
