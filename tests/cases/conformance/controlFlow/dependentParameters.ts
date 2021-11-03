type Args = ['A', number] | ['B', string]

declare function fn10(cb: (...args: Args) => void): void

fn10((kind, data) => {
    if (kind === 'A') {
        data.toFixed();
    }
    if (kind === 'B') {
        data.toUpperCase();
    }
})
