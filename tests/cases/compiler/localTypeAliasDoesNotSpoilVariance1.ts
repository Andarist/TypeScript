// @strict: true
// @noEmit: true

class A1<T = number> {
  value!: T;
  child!: InstanceType<typeof A1.B<A1<T>>>;

  static B = class B<T extends A1 = A1> {
    parent!: T;
  };
}

export var a1 = new A1();
a1.child.parent.value;

class A2<T = number> {
  foo() {
    type _<T extends A2 = A2> = 0;
  }
  value!: T;
  child!: InstanceType<typeof A2.B<A2<T>>>;

  static B = class B<T extends A2 = A2> {
    parent!: T;
  };
}

export var a2 = new A2();
a2.child.parent.value;
