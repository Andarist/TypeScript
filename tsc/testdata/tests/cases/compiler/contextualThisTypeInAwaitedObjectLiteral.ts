// @strict: true
// @target: es2022
// @noEmit: true

type O = { value: number; method(): void };

const asyncReturn: () => Promise<O> = async () => {
    return {
        value: 5,
        method() {
            this satisfies O;
            this.value;
        },
    };
};

async function awaitOperand() {
    const x: O = await {
        value: 5,
        method() {
            this.value;
        },
    };
}

const explicitUnion: O | PromiseLike<O> = {
    value: 5,
    method() {
        this.value;
    },
};

// The literal has a 'then' member, so it may be a thenable and 'this' keeps the PromiseLike constituent
const withThen: O | PromiseLike<O> = {
    value: 5,
    method() {
        this.value; // error
    },
    then() {
        return this as any;
    },
};

// An optional 'then' doesn't require the literal to be a thenable
type MaybeThenable = { then?(): void; other: string };
const optionalThen: O | MaybeThenable = {
    value: 5,
    method() {
        this.value; // error
    },
};

declare const spread: {};
const withSpread: O | PromiseLike<O> = {
    ...spread,
    value: 5,
    method() {
        this.value; // error
    },
};
