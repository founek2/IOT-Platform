import argon2 from "argon2"

const salt = Buffer.from("martas".repeat(2))

async function run() {
    const hash = await argon2.hash("aKwkd+W1O53Pj21U/B+txwtH1jaRlq", {
        salt
    })
    console.log(hash)

    const [userName, raw] = Buffer.from("bWFydGFzOmFLd2tkK1cxTzUzUGoyMVUvQit0eHd0SDFqYVJscQ==", "base64").toString().split(":")
    console.log(userName, raw)
}
run()

