// @allowJs: true
// @checkJs: true
// @strict: true
// @outDir: /out
// @Filename: /a.js
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
