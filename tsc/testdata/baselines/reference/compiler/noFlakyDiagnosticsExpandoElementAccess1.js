//// [tests/cases/compiler/noFlakyDiagnosticsExpandoElementAccess1.ts] ////

//// [a.js]
/**
 * @param {any} a
 * @param {any} b
 */
export function f(a, b) {
    const properties = {};
    const x = properties[a] = 1;
    const y = properties[b] = 1;
    properties.skip = isNaN(x) || isNaN(y);
}


//// [a.js]
/**
 * @param {any} a
 * @param {any} b
 */
export function f(a, b) {
    const properties = {};
    const x = properties[a] = 1;
    const y = properties[b] = 1;
    properties.skip = isNaN(x) || isNaN(y);
}
