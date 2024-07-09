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
    const Key = `${pack.name}-${pack.version}.exe`
    const Body = fs.readFileSync(argv.file)
    const config = {
        region: process.env.S3_REGION,
        credentials: {
            accessKeyId: process.env.S3_KEY_ID!,
            secretAccessKey: process.env.S3_KEY!,
        },
    }
    console.log("config", config)
    console.log("bucket", process.env.S3_BUCKET)
    console.log("object key", Key)
    const parallelUploads3 = new Upload({
        client: new S3(config) || new S3Client(config),
        params: {
            Bucket: process.env.S3_BUCKET,
            Key,
            Body,
        },
        tags: [{ Key: "Version", Value: pack.version }],
        queueSize: 4,
        partSize: 1024 * 1024 * 10,
        leavePartsOnError: false,
    })

    parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress)
    })

    await parallelUploads3.done()
}

main()
