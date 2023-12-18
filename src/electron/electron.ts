import { app, BrowserWindow, ipcMain, protocol } from "electron"
if (require("electron-squirrel-startup")) app.quit()
import { MeasurementRunner } from "../measurement"
import { Events } from "./enums/events.enum"
import Protocol from "./lib/protocol"
import {
    ACTIVE_CLIENT,
    ACTIVE_LANGUAGE,
    ACTIVE_SERVER,
    DEFAULT_LANGUAGE,
    IP_VERSION,
    Store,
    TERMS_ACCEPTED_VERSION,
} from "../measurement/services/store.service"
import { CrowdinService } from "../measurement/services/crowdin.service"
import { ControlServer } from "../measurement/services/control-server.service"
import { EIPVersion } from "../measurement/enums/ip-version.enum"
import { UserSettingsRequest } from "../measurement/dto/user-settings-request.dto"
import { IMeasurementServerResponse } from "../measurement/interfaces/measurement-server-response.interface"
import { LoopService } from "../measurement/services/loop.service"
import { ILoopModeInfo } from "../measurement/interfaces/measurement-registration-request.interface"
import { EMeasurementStatus } from "../measurement/enums/measurement-status.enum"
import { ERoutes } from "../ui/src/app/enums/routes.enum"
import { createWindow } from "./lib/create-window"
import { getEnv } from "./lib/get-env"
import { openPdf } from "./lib/open-pdf"

// Needs to be called before app is ready;
// gives our scheme access to load relative files,
// as well as local storage, cookies, etc.
// https://electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
protocol.registerSchemesAsPrivileged([
    {
        scheme: Protocol.scheme,
        privileges: {
            standard: true,
            secure: true,
        },
    },
])

app.on("window-all-closed", () => {
    app.quit()
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on(Events.QUIT, () => {
    app.quit()
})

ipcMain.handle(Events.GET_TRANSLATIONS, async (event, lang: string) => {
    return await CrowdinService.I.getTranslations(lang)
})

ipcMain.handle(Events.GET_NEWS, async () => {
    return await ControlServer.I.getNews()
})

ipcMain.on(Events.ACCEPT_TERMS, (event, terms: number) => {
    Store.set(TERMS_ACCEPTED_VERSION, terms)
})

ipcMain.handle(Events.REGISTER_CLIENT, async (event) => {
    const webContents = event.sender
    try {
        const settings = await MeasurementRunner.I.registerClient()
        if (settings.shouldAcceptTerms) {
            webContents.send(Events.OPEN_SCREEN, ERoutes.TERMS_CONDITIONS)
        }
        return settings
    } catch (e) {
        webContents.send(Events.ERROR, e)
    }
})

ipcMain.on(Events.SET_IP_VERSION, (event, ipv: EIPVersion | null) => {
    Store.set(IP_VERSION, ipv)
})

ipcMain.on(Events.SET_ACTIVE_CLIENT, (event, client: string) => {
    Store.set(ACTIVE_CLIENT, client)
})

ipcMain.on(Events.SET_ACTIVE_LANGUAGE, (event, language: string) => {
    Store.set(ACTIVE_LANGUAGE, language)
})

ipcMain.on(Events.SET_DEFAULT_LANGUAGE, (event, language: string) => {
    Store.set(DEFAULT_LANGUAGE, language)
})

ipcMain.on(
    Events.SET_ACTIVE_SERVER,
    (event, server: IMeasurementServerResponse | null) => {
        Store.set(ACTIVE_SERVER, server)
    }
)

const onRunMeasurement = async (event, loopModeInfo?: ILoopModeInfo) => {
    const webContents = event.sender
    try {
        const status = await MeasurementRunner.I.runMeasurement({
            loopModeInfo,
        })
        if (status === EMeasurementStatus.ABORTED) {
            webContents.send(Events.MEASUREMENT_ABORTED)
        } else if (loopModeInfo) {
            const { test_counter: counter, max_tests: maxTests } = loopModeInfo
            if (counter >= (maxTests || Infinity)) {
                webContents.send(Events.MAX_TESTS_REACHED)
                LoopService.I.resetTimeout()
            }
        }
    } catch (e) {
        webContents.send(Events.ERROR, e)
    }
}

ipcMain.on(Events.RUN_MEASUREMENT, onRunMeasurement)

ipcMain.on(Events.ABORT_MEASUREMENT, () => {
    LoopService.I.resetTimeout()
    MeasurementRunner.I.abortMeasurement()
})

const onScheduleLoop = (event, loopInterval, loopModeInfo: ILoopModeInfo) => {
    const webContents = event.sender
    onRunMeasurement(event, loopModeInfo)
    if (loopModeInfo.test_counter < (loopModeInfo.max_tests || Infinity)) {
        LoopService.I.scheduleLoop({
            interval: loopInterval,
            loopModeInfo,
            onTime: (counter) => {
                webContents.send(Events.RESTART_MEASUREMENT, counter)
                onScheduleLoop(event, loopInterval, {
                    ...loopModeInfo,
                    test_counter: counter,
                })
            },
            onExpire: () => {
                webContents.send(Events.LOOP_MODE_EXPIRED)
            },
        })
    }
}

ipcMain.on(
    Events.SCHEDULE_LOOP,
    (event, loopInterval, loopModeInfo: ILoopModeInfo) => {
        const timeFromWholeSecond = Date.now() % 1000
        setTimeout(
            () => onScheduleLoop(event, loopInterval, loopModeInfo),
            1000 - timeFromWholeSecond
        )
    }
)

ipcMain.on(Events.DELETE_LOCAL_DATA, () => {
    Store.wipeDataAndQuit()
})

ipcMain.handle(Events.GET_ENV, getEnv)

ipcMain.handle(Events.GET_CPU_USAGE, () => {
    return MeasurementRunner.I.getCPUUsage()
})

ipcMain.handle(Events.GET_MEASUREMENT_STATE, () => {
    return MeasurementRunner.I.getCurrentPhaseState()
})

ipcMain.handle(Events.GET_MEASUREMENT_RESULT, async (event, testUuid) => {
    const webContents = event.sender
    try {
        const result = await ControlServer.I.getMeasurementResult(testUuid)
        return result
    } catch (e) {
        webContents.send(Events.ERROR, e)
    }
})

ipcMain.handle(
    Events.GET_MEASUREMENT_HISTORY,
    async (event, paginator, sort) => {
        const webContents = event.sender
        try {
            return await ControlServer.I.getMeasurementHistory(paginator, sort)
        } catch (e) {
            webContents.send(Events.ERROR, e)
        }
    }
)

ipcMain.handle(Events.GET_SERVERS, async (event) => {
    const webContents = event.sender
    try {
        return await ControlServer.I.getMeasurementServersFromApi(
            new UserSettingsRequest()
        )
    } catch (e) {
        webContents.send(Events.ERROR, e)
    }
})

ipcMain.on(Events.OPEN_PDF, (_, url) => openPdf(url))

app.whenReady().then(() => createWindow())
app.disableHardwareAcceleration()
