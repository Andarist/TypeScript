
function funcxxx<T extends { foo: 1 }>(arg: T): void {}

funcxxx({ foo: 1, ba: 1 });


