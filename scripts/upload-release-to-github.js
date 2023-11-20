require("dotenv").config(process.env.RMBT_DESKTOP_DOTENV_CONFIG_PATH || ".env")
const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})
const packJson = require("../package.json")
const fs = require("fs")
const path = require("path")
const owner = "specure"
const repo = "open-rmbt-node"

async function main() {
    const release = await createRelease()
    await uploadBuild(release)
}

async function createRelease() {
    const name = "v" + packJson.version
    const release = await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: name,
        name,
        draft: false,
        prerelease: false,
        generate_release_notes: false,
        target_commitish: "master",
    })
    console.log(release.data)
    return release
}

async function uploadBuild(release) {
    const name = `${packJson.productName}-${packJson.version} Setup.exe`
    const buildPath = path.resolve(
        __dirname,
        "..",
        "out",
        "make",
        "squirrel.windows",
        "x64",
        name
    )
    console.log(`Uploading ${buildPath}, ${release.data.id}`)
    const data = fs.readFileSync(buildPath)
    const resp = await octokit.repos.uploadReleaseAsset({
        owner,
        repo,
        release_id: release.data.id,
        name,
        data,
        headers: {
            "content-type": "application/octet-stream",
            "content-length": data.byteLength,
        },
    })
    console.log(resp)
}

main()
