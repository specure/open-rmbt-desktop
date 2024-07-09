import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"
import fs from "fs"
import pack from "../package.json"
import yargs from "yargs"
const argv = yargs.option("file", {
    alias: "f",
    demandOption: true,
    type: "string",
}).argv
import dotenv from "dotenv"
dotenv.config()

async function main() {
    const Body = fs.readFileSync(argv.file)
    console.log("process.env.S3_REGION", process.env.S3_REGION)
    console.log("process.env.S3_BUCKET", process.env.S3_BUCKET)
    console.log("process.env.S3_KEY", process.env.S3_KEY)
    const parallelUploads3 = new Upload({
        client:
            new S3({
                region: process.env.S3_REGION,
            }) ||
            new S3Client({
                region: process.env.S3_REGION,
            }),
        params: {
            Bucket: process.env.S3_BUCKET,
            Key: process.env.S3_KEY,
            Body,
        },
        tags: [{ Key: "Version", Value: pack.version }],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
    })

    parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress)
    })

    await parallelUploads3.done()
}

main()
