import emitter from './eventEmitter.js';

const user = {
    id: 1,
    userName: "founel",
    firstName: "Martin",
    lastName: "Skalický",
    email: "neco@kekel.cz",
    createdAt: new Date(),
    updatedAt: new Date(),
    password: "leleů",
    lastActivity: new Date(),
}
describe("Event emitter", () => {
    test("shoud emit and recieve with arg", () => {
        emitter.on("user_login", (userObj) => {
            expect(userObj).toEqual(user)
        })

        emitter.emit("user_login", user)
    });

    test("shoud subscribe and unsub", () => {
        let cntr = 0;
        const handler = () => {
            expect(cntr).toBe(0)

            cntr += 1
            emitter.off("user_login", handler)
            emitter.emit("user_login", user)
            expect(cntr).toBe(1)
        }

        emitter.on("user_login", handler)
        emitter.emit("user_login", user)
    });
});



