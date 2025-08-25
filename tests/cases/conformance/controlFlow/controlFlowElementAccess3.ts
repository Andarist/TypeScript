// @strict: true
// @target: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/61176

const EnumLike1 = { FOO: "foo", BAR: "bar" } as const;
const obj1 = { [EnumLike1.FOO]: Math.random() < 0.5 ? "abc" : undefined };
if (obj1[EnumLike1.FOO]) {
  obj1[EnumLike1.FOO].toUpperCase(); // ok
}

const alias1 = obj1[EnumLike1.FOO];
if (alias1) {
  obj1[EnumLike1.FOO].toUpperCase(); // error
}

const obj2 = { [EnumLike1.FOO]: Math.random() < 0.5 ? "abc" : undefined } as const;
const alias2 = obj2[EnumLike1.FOO];

if (alias2) {
  obj2[EnumLike1.FOO].toUpperCase(); // ok
}

const MutableEnumLike1 = { FOO: "foo", BAR: "bar" };
const obj3 = { [MutableEnumLike1.FOO]: Math.random() < 0.5 ? "abc" : undefined };
if (obj3[MutableEnumLike1.FOO]) {
  obj3[MutableEnumLike1.FOO].toUpperCase(); // ok
}

if (obj3[MutableEnumLike1.FOO]) {
  obj3[MutableEnumLike1.FOO] = undefined;
  obj3[MutableEnumLike1.FOO].toUpperCase(); // error
}

const alias3 = obj3[MutableEnumLike1.FOO];
if (alias3) {
  obj3[MutableEnumLike1.FOO].toUpperCase(); // error
}

declare const MutableEnumLike2: {
  FOO: "foo" | undefined;
  BAR: "bar" | undefined;
};
if (MutableEnumLike2.FOO) {
  const o = { [MutableEnumLike2.FOO]: Math.random() < 0.5 ? "abc" : undefined };
  if (o[MutableEnumLike2.FOO]) {
    o[MutableEnumLike2.FOO].toUpperCase(); // ok
  }
}
if (MutableEnumLike2.FOO) {
  const o = { [MutableEnumLike2.FOO]: Math.random() < 0.5 ? "abc" : undefined };
  if (o[MutableEnumLike2.FOO]) {
    MutableEnumLike2.FOO = undefined;
    o[MutableEnumLike2.FOO].toUpperCase(); // error
  }
}
declare const MutableEnumLike3: {
  FOO: "a" | "b";
  BAR: "c" | "d";
};
if (MutableEnumLike3.FOO === "a") {
  const o = {
    [MutableEnumLike3.FOO]: Math.random() < 0.5 ? "abc" : undefined,
  };
  if (o[MutableEnumLike3.FOO]) {
    MutableEnumLike3.FOO = 'b';
    o[MutableEnumLike3.FOO].toUpperCase(); // error
  }
}
if (MutableEnumLike3.FOO === "a") {
  const o = {
    [MutableEnumLike3.FOO]: Math.random() < 0.5 ? "abc" : undefined,
    b: Math.random() < 0.5 ? "def" : undefined
  };
  if (o[MutableEnumLike3.FOO]) {
    MutableEnumLike3.FOO = 'b';
    o[MutableEnumLike3.FOO].toUpperCase(); // error
  }
}

const sym1 = Symbol();
const sym2 = Symbol();

const EnumLike2 = { [sym1]: "foo", [sym2]: "bar" } as const;
const obj4 = {
  [EnumLike2[sym1]]: Math.random() < 0.5 ? "abc" : undefined,
  [EnumLike2[sym2]]: Math.random() < 0.5 ? "def" : undefined,
};
if (obj4[EnumLike2[sym1]]) {
  obj4[EnumLike2[sym1]].toUpperCase();
}

const MutableEnumLike4 = { [sym1]: "foo", [sym2]: "bar" };
const obj5 = { [MutableEnumLike4[sym1]]: Math.random() < 0.5 ? "abc" : undefined };
if (obj5[MutableEnumLike4[sym1]]) {
  obj5[MutableEnumLike4[sym1]].toUpperCase(); // ok
}

const alias4 = obj5[MutableEnumLike4[sym1]];
if (alias4) {
  obj5[MutableEnumLike4[sym1]].toUpperCase(); // error
}

function test1(k: keyof typeof EnumLike2) {
  obj4[EnumLike2[k]].toUpperCase(); // error

  if (obj4[EnumLike2[k]]) {
    obj4[EnumLike2[k]].toUpperCase(); // ok
  }
}

function test2(k: keyof typeof EnumLike2) {
  if (Math.random()) {
    k = sym1; // mutate k
  }
  if (obj4[EnumLike2[k]]) {
    obj4[EnumLike2[k]].toUpperCase(); // error
  }
}

// https://github.com/microsoft/TypeScript/issues/62332

const LabelLookup = { INNER_LABEL: "INNER_LABEL" } as const;

let response: Record<typeof LabelLookup.INNER_LABEL | number, string[] | null> =
  {
    [LabelLookup.INNER_LABEL]: null,
  };

declare let b1: boolean;

if (b1) {
  response[LabelLookup.INNER_LABEL] ??= [];
  response[LabelLookup.INNER_LABEL].push("a");
}
