import { Time } from "../../services/time.service"
import { ELoggerMessage } from "../../enums/logger-message.enum"
import { ESocketMessage } from "../../enums/socket-message.enum"
import { Logger } from "../../services/logger.service"
import { DownloadMessageHandler } from "../../services/message-handlers/download-message-handler.service"
import {
    mockResponse,
    mockClient,
    mockThread,
} from "../utils/rmbt-thread-mock.factory"
import { randomBytes } from "crypto"
import { RMBTClient } from "../../services/rmbt-client.service"
import fs from "fs"
import fsp from "fs/promises"
import * as st from "stream-throttle"

let handler: DownloadMessageHandler = new DownloadMessageHandler(
    mockThread,
    () => void 0
)
let globalSpy: jest.SpyInstance
const tempFile = "temp.txt"

afterAll(async () => {
    await fsp.unlink(tempFile)
})

test("Handler is initialized", () => {
    expect(typeof handler.stopMessaging).toBe("function")
    expect(typeof handler.readData).toBe("function")
    expect(typeof handler.writeData).toBe("function")
    const expectedLength =
        (Number(mockResponse.test_duration) * 1e9) /
        DownloadMessageHandler.minDiffTime
    expect(handler.result.maxStoredResults).toBe(expectedLength)
})

test("Handler writes data", () => {
    jest.useFakeTimers()
    globalSpy = jest.spyOn(global, "setInterval")
    const infoSpy = jest.spyOn(Logger.I, "info")
    const msg = `${ESocketMessage.GETTIME} ${mockResponse.test_duration}${
        mockThread.chunkSize === mockThread.defaultChunkSize
            ? "\n"
            : ` ${mockThread.chunkSize}\n`
    }`
    const startTime = Time.nowNs()
    const endTime = Time.nowNs() + Number(mockResponse.test_duration) * 1e9

    handler.writeData()

    expect(handler.downloadStartTime).toBe(startTime)
    expect(handler.downloadEndTime).toBe(endTime)
    expect(setInterval).toHaveBeenCalledTimes(2)
    expect(infoSpy).toHaveBeenCalledWith(
        ELoggerMessage.T_SENDING_MESSAGE,
        mockThread.index,
        msg
    )
    expect(mockClient.write).toHaveBeenCalledTimes(1)
    expect(mockClient.write).toHaveBeenCalledWith(msg)
})

test("Handler reads data", async () => {
    jest.useRealTimers()
    globalSpy.mockRestore()
    const endTimeS = Number(mockResponse.test_duration)
    const chunksAmount = 100
    const chunk = randomBytes(mockThread.chunkSize)
    const expectedSpeedMbps = 2000

    fs.writeFileSync(tempFile, "")
    for (let i = 0; i < endTimeS * chunksAmount; i++) {
        if (i < endTimeS - 1) {
            chunk[chunk.length - 1] = 0x00
        } else {
            chunk[chunk.length - 1] = 0xff
        }
        await fsp.appendFile(tempFile, chunk)
    }

    await new Promise((resolve) => {
        handler = new DownloadMessageHandler(mockThread, () => void 0)
        const tempReadStream = fs
            .createReadStream(tempFile)
            .pipe(new st.Throttle({ rate: (expectedSpeedMbps / 8) * 1e6 }))
        tempReadStream.on("data", (data) => handler.readData(data as Buffer))
        tempReadStream.on("close", () => {
            const newSpeed = Math.round(
                RMBTClient.getFineResult(
                    [{ ...mockThread.threadResult!, down: handler.result }],
                    "down"
                ).speed / 1e6
            )
            expect(handler.downloadBytesRead).toBe(
                mockThread.chunkSize * endTimeS * chunksAmount
            )
            expect(handler.nsec).toBe(Infinity)
            expect(newSpeed).toBe(expectedSpeedMbps)
            resolve(void 0)
        })
    })
}, 60000)
