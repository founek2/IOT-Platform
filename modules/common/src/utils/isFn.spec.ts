import isFn from './isFn.js'

describe("getInPath", () => {
    test("simple", () => {
        expect(isFn("ahoj")).toBe(false)
        expect(isFn(3)).toBe(false)
        expect(isFn([])).toBe(false)
        expect(isFn({ title: "snehurka" })).toBe(false)
        expect(isFn(() => { })).toBe(true)
    });
});



