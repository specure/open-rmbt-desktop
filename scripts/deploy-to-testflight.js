const { execSync } = require("child_process")
const packJson = require("../package.json")
const path = require("path")

function main() {
    const buildPath = path.resolve(
        __dirname,
        "../out/make/",
        `${packJson.productName}-${packJson.version}-x64.pkg`
    )
    try {
        execSync(
            `xcrun altool --upload-app -f ${buildPath} -t macos --apiKey ${process.env.APP_STORE_API_KEY_ID} --apiIssuer ${process.env.APP_STORE_API_ISSUER_ID}`
        )
    } catch (e) {
        console.log(e)
    }
}

main()
