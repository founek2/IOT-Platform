import getInPath from './getInPath.js'

describe("getInPath", () => {
    test("simple", () => {
        const obj = { path: { to: { data: 3 } } }

        expect(getInPath("path.to.data", obj)).toBe(obj.path.to.data)
        expect(getInPath("path.to.data", undefined)).toBe(undefined)
        expect([getInPath("path.3.data", obj), getInPath("data.to.path", obj)]).toEqual([undefined, undefined])
    });

    test("advanced", () => {
        const obj = {
            data: "lala",
            inner: {
                posts: [{ comment: "ahoj" }, {
                    title: {
                        line: "super"
                    }
                }]
            }
        }

        expect(getInPath("data", obj)).toBe(obj.data)
        expect(getInPath("inner", obj)).toEqual(obj.inner)
        expect(getInPath("inner.posts", obj)).toEqual(obj.inner.posts)
        expect(getInPath("inner.posts.0.comment", obj)).toBe(obj.inner.posts[0].comment)
        expect(getInPath("inner.posts.3.comment", obj)).toBe(undefined)
    });

});



