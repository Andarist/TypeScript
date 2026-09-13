// @strict: true
// @noEmit: true

// Intra-expression inferences must flow through reverse mapped (homomorphic mapped type) inferences,
// where the inference for T is made from the entire source object rather than property by property.

declare function f<T>(arg: {
    [K in keyof T]: {
        produce: (n: string) => T[K];
        consume: (x: T[K]) => void;
    };
}): T;

// Non-context sensitive producers (worked before)
const r1 = f({ a: { produce: () => "hello", consume: x => x.toLowerCase() } });
const r2 = f({ a: { produce: (n: string) => n, consume: x => x.toLowerCase() } });

// Context sensitive producers
const r3 = f({ a: { produce: n => n, consume: x => x.toLowerCase() } });
const r4 = f({ a: { produce: function () { return "hello"; }, consume: x => x.toLowerCase() } });
const r5 = f({ a: { produce() { return "hello"; }, consume: x => x.toLowerCase() } });

// Sibling with an inferable type alongside the context sensitive ones
declare function g<T>(arg: {
    [K in keyof T]: {
        produce: (n: string) => T[K];
        consume: (x: T[K]) => void;
        tag?: number;
    };
}): T;

const r6 = g({ a: { produce: n => n, consume: x => x.toLowerCase(), tag: 1 } });

// Multiple keys. T is fixed when the first consumer is checked, but members of the reverse mapped
// type are resolved lazily, so producers of later keys still contribute when those keys are read.
const r7 = g({
    a: { produce: n => n, consume: x => x.toLowerCase() },
    b: { produce: () => 1, consume: x => x.toFixed() },
});
const r8 = g({
    b: { produce: () => 1, consume: x => x.toFixed() },
    a: { produce: n => n, consume: x => x.toLowerCase() },
});

// Tuples in the template
declare function h<T>(arg: {
    [K in keyof T]: [(n: string) => T[K], (x: T[K]) => void];
}): T;

const r9 = h({ a: [n => n, x => x.toLowerCase()] });

// Nested reverse mappings
declare function nested<T>(arg: {
    [K in keyof T]: {
        [J in keyof T[K]]: {
            produce: (n: string) => T[K][J];
            consume: (x: T[K][J]) => void;
        };
    };
}): T;

const r14 = nested({ a: { b: { produce: n => n, consume: x => x.toLowerCase() } } });

// Reverse mapping nested inside a non-mapped structure
declare function wrapped<T>(arg: {
    items: {
        [K in keyof T]: {
            produce: (n: string) => T[K];
            consume: (x: T[K]) => void;
        };
    };
    other: (x: T) => void;
}): T;

const r15 = wrapped({
    items: { a: { produce: n => n, consume: x => x.toLowerCase() } },
    other: t => t.a.toLowerCase(),
});

// Two type parameters fixed at different points; the types recorded for earlier sites must remain
// available when the second type parameter is fixed.
declare function two<T, U>(arg: {
    first: { [K in keyof T]: { produce: (n: string) => T[K]; consume: (x: T[K]) => void } };
    second: { [K in keyof U]: { produce: (n: string) => U[K]; consume: (x: U[K], t: T) => void } };
}): [T, U];

const r16 = two({
    first: { a: { produce: n => n, consume: x => x.toLowerCase() } },
    second: { b: { produce: n => n.length, consume: (x, t) => x.toFixed() + t.a.toLowerCase() } },
});

// Errors are still reported
const r17 = f({ a: { produce: n => n, consume: x => x.toFixed() } });

// Closures returning the producer/consumer object
declare function thunk<T>(arg: {
    [K in keyof T]: () => { produce: (n: string) => T[K]; consume: (x: T[K]) => void };
}): T;

const r18 = thunk({
    a() { return { produce: n => n, consume: x => x.toLowerCase() }; },
    b: () => ({ produce: n => n.length, consume: x => x.toFixed() }),
});

declare function callback<T>(arg: {
    [K in keyof T]: (flag: boolean) => { produce: (n: string) => T[K]; consume: (x: T[K]) => void };
}): T;

const r19 = callback({
    a(flag) { return { produce: n => n, consume: x => x.toLowerCase() }; },
    b: flag => ({ produce: n => n.length, consume: x => x.toFixed() }),
});

declare function tupleThunk<T>(arg: {
    [K in keyof T]: () => [(n: string) => T[K], (x: T[K]) => void];
}): T;

const r20 = tupleThunk({
    a() { return [n => n, x => x.toLowerCase()]; },
    b() { return [n => n.length, x => x.toFixed()]; },
});

// Intersections of mapped types over different type parameters
declare function both<T1, T2>(arg: {
    [K in keyof T1]: { produce1: (n: string) => T1[K]; consume1: (x: T1[K]) => void };
} & {
    [K in keyof T2]: { produce2: (n: string) => T2[K]; consume2: (x: T2[K]) => void };
}): [T1, T2];

const r21 = both({
    a: {
        produce1: n => n, consume1: x => x.toLowerCase(),
        produce2: n => [n], consume2: x => x[0].toLowerCase(),
    },
    b: {
        produce1: n => n.length, consume1: x => x.toFixed(),
        produce2: n => ({ v: n }), consume2: x => x.v.toLowerCase(),
    },
});

// A mapped type intersected with a concrete member
declare function mixed<T1, T2>(arg: {
    [K in keyof T1]: { produce: (n: string) => [T1[K], any]; consume: (x: T1[K]) => void };
} & {
    a: { produce: (n: string) => [any, T2]; consume2: (x: T2) => void };
}): [T1, T2];

const r22 = mixed({
    a: {
        produce: n => [n, [n]],
        consume2: x => x[0].toLowerCase(),
        consume: x => x.toLowerCase(),
    },
    b: {
        produce: n => [n.length, null],
        consume: x => x.toFixed(),
    },
});

// A property that is never read during the call is completed from the checked argument
const r23 = f({
    a: { produce: n => n, consume: x => x.toLowerCase() },
    b: { produce: n => n.length, consume: () => {} },
});
r23.b.toFixed();

// Keys whose producers were checked earlier, read through a later key's consumer of the whole type
declare function whole<T>(arg: {
    [K in keyof T]: {
        seed?: T[K];
        produce?: (n: string) => T[K];
        consume?: (x: T[K]) => void;
        consumeAll?: (x: T) => void;
    };
}): T;

const r24 = whole({
    earlier: { produce: n => ({ value: n }) },
    later: { produce: n => n, consumeAll: x => x.earlier.value.toLowerCase() },
    partial: { seed: { value: "known" }, consume: x => x.value.toLowerCase() },
    full: { seed: 123 },
});
r24.earlier.value.toLowerCase();
r24.later.toLowerCase();
r24.partial.value.toLowerCase();
r24.full.toFixed();

declare function indexed<T extends { earlier: unknown }>(arg: {
    [K in keyof T]: {
        produce?: (n: string) => T[K];
        consumeEarlier?: (x: T["earlier"]) => void;
    };
}): T;

const r25 = indexed({
    earlier: { produce: n => ({ value: n }) },
    later: { produce: n => n, consumeEarlier: x => x.value.toLowerCase() },
});
r25.earlier.value.toLowerCase();
r25.later.toLowerCase();

// A key with no producer at all stays unknown
const r26 = whole({
    earlier: { produce: n => ({ value: n }) },
    later: { consumeAll: x => x.earlier.value.toLowerCase() },
});
r26.earlier.value.toLowerCase();

declare function pairs<T>(arg: {
    [K in keyof T]: [(n: string) => T[K], (x: T) => void];
}): T;

const r27 = pairs({
    earlier: [n => ({ value: n }), x => {}],
    later: [n => n, x => x.earlier.value.toLowerCase()],
});
r27.earlier.value.toLowerCase();
r27.later.toLowerCase();
