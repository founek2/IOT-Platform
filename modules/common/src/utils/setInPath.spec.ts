import setInPath from './setInPath.js'
import { clone } from 'ramda'

describe("getInPath", () => {
    test("simple", () => {
        expect(setInPath("title.line", "Best", undefined)).toEqual({ title: { line: "Best" } })
        expect(setInPath("title.line", "Best", {})).toEqual({ title: { line: "Best" } })
        expect(setInPath("0", "number", [])).toEqual(["number"])
        expect(setInPath("2", "number", [])).toEqual([undefined, undefined, "number"])
        expect(setInPath("3", "number", {})).toEqual({ 3: "number" })
    });

    test("advanced", () => {
        expect(setInPath("body.posts.1.headline", "Snehurka", {})).toEqual({ body: { posts: [undefined, { headline: "Snehurka" }] } })
        expect(setInPath("body.posts.1.headline", { subline: "lala" }, {})).toEqual({ body: { posts: [undefined, { headline: { subline: "lala" } }] } })
        const data = [null, { ahoj: [333, { key: "twenty" }] }]
        const orig = {
            first: 11,
            body: {
                posts: {
                    seasson: [1, 2, 3]
                }
            }
        }
        const output = clone(orig)
        // @ts-ignore
        output.body.posts["1"] = { headline: data }

        expect(setInPath("body.posts.1.headline", data, orig)).toEqual(output)
    });
});



