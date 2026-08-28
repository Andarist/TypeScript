// @target: es2015
// @strict: true
// @noEmit: true

declare function mixin<Base extends new (...args: any[]) => any>(base: Base): any;

declare class Document1<Parent, Owner = Parent> {
    constructor(owner: Owner);
    owner: Owner;
}

declare class BaseItem1 extends Document1<typeof Item1> {}

declare class Item1 extends mixin(BaseItem1) {}

const item1 = new BaseItem1(Item1);
const owner1: typeof Item1 = item1.owner;

new BaseItem1(123);

declare class Document2<Parent> {
    constructor(owner: Parent);
    owner: Parent;
}

declare class BaseItem2 extends Document2<typeof Item2> {}

declare class Item2 extends mixin<typeof BaseItem2>(BaseItem2) {}

const item2 = new BaseItem2(Item2);
const owner2: typeof Item2 = item2.owner;

new BaseItem2(123);

declare class Item3 extends Document2<InstanceType<typeof Item3>> {}

declare const existingItem3: Item3;
const item3 = new Item3(existingItem3);
const owner3: Item3 = item3.owner;

new Item3(123);

export {};
