import { Injectable, NgZone } from "@angular/core"
import {
    BehaviorSubject,
    concatMap,
    from,
    interval,
    map,
    of,
    takeWhile,
} from "rxjs"
import { TestVisualizationState } from "../dto/test-visualization-state.dto"
import { ITestVisualizationState } from "../interfaces/test-visualization-state.interface"
import { IBasicNetworkInfo } from "../../../../measurement/interfaces/basic-network-info.interface"
import { BasicNetworkInfo } from "../dto/basic-network-info.dto"
import { ISimpleHistoryResult } from "../../../../measurement/interfaces/simple-history-result.interface"
import { TestPhaseState } from "../dto/test-phase-state.dto"
import { EMeasurementStatus } from "../../../../measurement/enums/measurement-status.enum"
import { Router } from "@angular/router"
import { MainStore } from "./main.store"
import { IMeasurementServerResponse } from "../../../../measurement/interfaces/measurement-server-response.interface"
import { ERoutes } from "../enums/routes.enum"
import { ILoopModeInfo } from "../../../../measurement/interfaces/measurement-registration-request.interface"
import { v4 } from "uuid"
import { MessageService } from "../services/message.service"

export const STATE_UPDATE_TIMEOUT = 200

@Injectable({
    providedIn: "root",
})
export class TestStore {
    basicNetworkInfo$ = new BehaviorSubject<IBasicNetworkInfo>(
        new BasicNetworkInfo()
    )
    visualization$ = new BehaviorSubject<ITestVisualizationState>(
        new TestVisualizationState()
    )
    simpleHistoryResult$ = new BehaviorSubject<ISimpleHistoryResult | null>(
        null
    )
    servers$ = new BehaviorSubject<IMeasurementServerResponse[]>([])
    testIntervalMinutes$ = new BehaviorSubject<number | null>(null)
    enableLoopMode$ = new BehaviorSubject<boolean>(false)
    loopCounter$ = new BehaviorSubject<number>(1)
    loopUuid$ = new BehaviorSubject<string | null>(null)

    constructor(
        private message: MessageService,
        private mainStore: MainStore,
        private ngZone: NgZone,
        private router: Router
    ) {
        window.electronAPI.onRestartMeasurement((loopCounter) => {
            this.ngZone.run(() => {
                this.loopCounter$.next(loopCounter + 1)
                this.router
                    .navigate(["/", ERoutes.SETTINGS], {
                        skipLocationChange: true,
                    })
                    .then(() => {
                        this.router.navigate(["/", ERoutes.TEST])
                    })
            })
        })
        window.electronAPI.onLoopModeExpired(() => {
            this.ngZone.run(() => {
                this.message.openConfirmDialog(
                    "The loop measurement has expired",
                    () => {
                        this.router.navigate(["/", ERoutes.HISTORY])
                    }
                )
            })
        })
    }

    launchTest() {
        this.resetState()
        const loopModeInfo: ILoopModeInfo | undefined =
            this.enableLoopMode$.value === true
                ? {
                      max_delay: this.testIntervalMinutes$.value ?? 0,
                      test_counter: this.loopCounter$.value,
                      loop_uuid: this.loopUuid$.value ?? "",
                  }
                : undefined
        window.electronAPI.runMeasurement(loopModeInfo)
        return interval(STATE_UPDATE_TIMEOUT).pipe(
            concatMap(() => from(window.electronAPI.getMeasurementState())),
            map((phaseState) => {
                const newState = TestVisualizationState.from(
                    this.visualization$.value,
                    phaseState,
                    this.mainStore.env$.value?.FLAVOR ?? "rtr"
                )
                this.visualization$.next(newState)
                this.basicNetworkInfo$.next(phaseState)
                return newState
            })
        )
    }

    launchLoopTest(interval: number) {
        this.loopUuid$.next(v4())
        this.loopCounter$.next(1)
        this.enableLoopMode$.next(true)
        this.testIntervalMinutes$.next(interval)
        this.router.navigate(["/", ERoutes.TEST])
    }

    disableLoopMode() {
        this.enableLoopMode$.next(false)
    }

    scheduleLoop() {
        const testIntervalMs = this.testIntervalMinutes$.value! * 60 * 1000
        window.electronAPI.scheduleLoop(testIntervalMs)
        return interval(200).pipe(
            map((ms: number) => ms * 200),
            takeWhile((ms) => ms <= testIntervalMs),
            map((ms) => {
                return {
                    ms: testIntervalMs - ms,
                    percent: (ms / testIntervalMs) * 100,
                }
            })
        )
    }

    getMeasurementResult(testUuid: string | null) {
        if (!testUuid || this.mainStore.error$.value) {
            return of(null)
        }
        return from(window.electronAPI.getMeasurementResult(testUuid)).pipe(
            map((result) => {
                this.simpleHistoryResult$.next(result)
                const newPhase = new TestPhaseState({
                    phase: EMeasurementStatus.SHOWING_RESULTS,
                    down: result.downloadKbit / 1000,
                    up: result.uploadKbit / 1000,
                    ping: result.ping / 1e6,
                })
                const newState = TestVisualizationState.fromHistoryResult(
                    result,
                    this.visualization$.value,
                    newPhase,
                    this.mainStore.env$.value?.FLAVOR ?? "rtr"
                )
                this.visualization$.next(newState)
                this.basicNetworkInfo$.next({
                    serverName: result.measurementServerName,
                    ipAddress: result.ipAddress,
                    providerName: result.providerName,
                })
                return result
            })
        )
    }

    getServers() {
        window.electronAPI.getServers().then((servers) => {
            this.servers$.next(servers)
        })
    }

    setActiveServer(server: IMeasurementServerResponse) {
        window.electronAPI.setActiveServer(server)
        const updatedServers = this.servers$.value.map((s) =>
            s.webAddress === server.webAddress
                ? { ...s, active: true }
                : { ...s, active: false }
        )
        this.servers$.next(updatedServers)
    }

    private resetState() {
        this.basicNetworkInfo$.next(new BasicNetworkInfo())
        this.visualization$.next(new TestVisualizationState())
        this.simpleHistoryResult$.next(null)
        this.mainStore.error$.next(null)
    }
}
