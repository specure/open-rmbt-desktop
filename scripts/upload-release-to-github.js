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
    let release
    try {
        release = await createRelease()
    } catch (e) {
        console.warn(e)
        console.warn(
            "Could not create new release. Looking for the latest one."
        )
        release = await getLastRelease()
    }
    const name = getTagName()
    if (release?.data.tag_name !== name) {
        throw new Error(
            `The latest release version ${release?.data.tag_name} does not match the current app version ${name}.`
        )
    }
    await uploadBuild(release)
}

async function getLastRelease() {
    const release = await octokit.repos.getLatestRelease({
        owner,
        repo,
    })
    console.log(release.data)
    return release
}

function getTagName() {
    return "v" + packJson.version
}

async function createRelease() {
    const name = getTagName()
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
    const normalizedName = `${packJson.productName}${packJson.version}Setup.exe`
    for (const asset of release.data.assets) {
        if (asset.name === normalizedName) {
            console.log("The build is already uploaded. Terminating the job.")
            return
        }
    }
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
        name: normalizedName,
        data,
        headers: {
            "content-type": "application/octet-stream",
            "content-length": data.byteLength,
        },
    })
    console.log(resp)
}

main()
