import chainHandler from './chainHandler.js'

describe("getInPath", () => {
    test("simple", () => {
        const params = ["ahoj", { title: "snehurka" }]
        chainHandler([
            (...args) => expect(args).toEqual(params),
            (...args) => expect(args).toEqual(params),
            (...args) => expect(args).toEqual(params),
        ])(...params)

        chainHandler([
            (...args) => expect(args).toEqual([]),
            (par) => expect(par).toEqual(undefined),
        ])()
    });
});



