require("dotenv").config(process.env.RMBT_DESKTOP_DOTENV_CONFIG_PATH || ".env")
const { Octokit } = require("@octokit/core")
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
    const release = await octokit.request(
        `POST /repos/${owner}/${repo}/releases`,
        {
            owner,
            repo,
            tag_name: "v" + packJson.version,
            target_commitish: "master",
            name: "v" + packJson.version,
            body: "",
            draft: false,
            prerelease: false,
            generate_release_notes: false,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        }
    )
    console.log(release.data)
    return release
}

async function uploadBuild(release) {
    const packName = `${packJson.productName}-${packJson.version} Setup.exe`
    const resp = await octokit.request(
        `POST /repos/${owner}/${repo}/releases/${release.data.id}/assets{?name,label}`,
        {
            owner,
            repo,
            release_id: release.data.id,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
            data: fs.readFileSync(
                path.resolve(
                    __dirname,
                    "..",
                    "out",
                    "make",
                    "squirrel.windows",
                    "x64",
                    packName
                )
            ),
        }
    )
    console.log(resp.data)
}

main()
