// @strict: true
// @noEmit: true

type SingleOrArray<T> = T | T[];

type Item =
  | {
      src: "foo";
    }
  | {
      src: "bar";
    };

const obj1: SingleOrArray<Item> = {
  src: "baz",
};

const obj2: SingleOrArray<Item> | undefined = {
  src: "baz",
};

const obj3: SingleOrArray<Item | undefined> = {
  src: "baz",
};

const obj4: SingleOrArray<Item | undefined> | undefined = {
  src: "baz",
};

const arr1: SingleOrArray<Item> = [{
  src: "baz",
}];

const arr2: SingleOrArray<Item> | undefined = [{
  src: "baz",
}];

const arr3: SingleOrArray<Item | undefined> = [{
  src: "baz",
}];

const arr4: SingleOrArray<Item | undefined> | undefined = [{
  src: "baz",
}];

type Logic<I, O> = (input: I) => O;

type Item2 =
  | {
      src: "foo";
      id: string;
    }
  | {
      src: Logic<never, unknown>;
      id?: never;
    };

declare const logic: Logic<string, number>;

const obj5: SingleOrArray<Item2> = {
  src: logic,
  id: "someId",
};

const obj6: SingleOrArray<Item2> | undefined = {
  src: logic,
  id: "someId",
};

const obj7: SingleOrArray<Item2 | undefined> = {
  src: logic,
  id: "someId",
};

const obj8: SingleOrArray<Item2 | undefined> | undefined = {
  src: logic,
  id: "someId",
};

const arr5: SingleOrArray<Item2> = [{
  src: logic,
  id: "someId",
}];

const arr6: SingleOrArray<Item2> | undefined = [{
  src: logic,
  id: "someId",
}];

const arr7: SingleOrArray<Item2 | undefined> = [{
  src: logic,
  id: "someId",
}];

const arr8: SingleOrArray<Item2 | undefined> | undefined = [{
  src: logic,
  id: "someId",
}];

export {}