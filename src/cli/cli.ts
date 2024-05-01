import dotenv from "dotenv"
dotenv.config()
import { MeasurementRunner } from "../measurement"
import readline from "readline/promises"
import { ACTIVE_CLIENT, Store } from "../measurement/services/store.service"
import yargs from "yargs"
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const axios = require("axios")
const argv = yargs.option("reset", {
    alias: "r",
    type: "boolean",
}).argv

async function main() {
    if (
        !fs.existsSync(
            path.resolve(
                __dirname,
                "..",
                "measurement",
                "services",
                "worker.service.js"
            )
        )
    ) {
        await promisify(exec)(
            "webpack --mode development --config ./webpack.cli.config.js"
        )
    }
    const { reset } = await argv
    try {
        let tenant = !reset ? (Store.get(ACTIVE_CLIENT) as string) : ""
        if (!tenant && process.env.CMS_URL) {
            console.log("Looking for available tenants")
            const tenantsAsset = (
                await axios.get(
                    `${process.env.CMS_URL}/upload/files?name=desktop-tenants.txt`
                )
            ).data?.[0]
            console.log("Tenants found at", tenantsAsset)
            if (tenantsAsset?.url) {
                console.log("Loading available tenants")
                const text = (
                    await axios.get(process.env.CMS_URL + tenantsAsset?.url)
                ).data
                console.log("---")
                console.log(text)
                console.log("---")
                const iface = readline.createInterface(
                    process.stdin,
                    process.stdout
                )
                tenant = await iface.question("Please pick your tenant:")
                iface.close()
            }
        }
        if (process.env.ENABLE_LOOP_MODE === "true") {
            while (true) {
                await MeasurementRunner.I.runMeasurement({
                    platform: process.env.PLATFORM_CLI,
                    tenant,
                })
                await new Promise((res) => {
                    setTimeout(() => res(void 0), 100)
                })
            }
        } else {
            await MeasurementRunner.I.runMeasurement({
                platform: process.env.PLATFORM_CLI,
                tenant,
            })
        }
    } catch (e) {
        console.error(e)
    } finally {
        process.exit()
    }
}

main()
