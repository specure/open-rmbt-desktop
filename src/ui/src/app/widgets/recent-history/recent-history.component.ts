import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core"
import { Observable, map, of, withLatestFrom } from "rxjs"
import { ITableColumn } from "src/app/interfaces/table-column.interface"
import { ERoutes } from "src/app/enums/routes.enum"
import { MainStore } from "src/app/store/main.store"
import { TranslocoService } from "@ngneat/transloco"
import { ISort } from "src/app/interfaces/sort.interface"
import { HistoryStore } from "src/app/store/history.store"
import {
    IHistoryRowONT,
    IHistoryRowRTR,
} from "src/app/interfaces/history-row.interface"
import { IEnv } from "../../../../../electron/interfaces/env.interface"

@Component({
    selector: "app-recent-history",
    templateUrl: "./recent-history.component.html",
    styleUrls: ["./recent-history.component.scss"],
})
export class RecentHistoryComponent implements OnInit {
    @Input() grouped?: boolean
    @Input() title?: string
    @Input() excludeColumns?: string[]
    @Output() sortChange: EventEmitter<ISort> = new EventEmitter()
    columns$: Observable<ITableColumn<IHistoryRowRTR | IHistoryRowONT>[]> =
        this.mainStore.env$.pipe(
            map((env) => {
                let cols: ITableColumn<IHistoryRowRTR | IHistoryRowONT>[] = []
                if (env?.FLAVOR === "ont") {
                    cols = [
                        {
                            columnDef: "measurementDate",
                            header: "history.table.date",
                            isSortable: true,
                            link: (id) =>
                                "/" +
                                ERoutes.TEST_RESULT.replace(":testUuid", id),
                        },
                        {
                            columnDef: "time",
                            header: "history.table.time",
                        },
                        {
                            columnDef: "providerName",
                            header: "test.provider",
                        },
                        {
                            columnDef: "download",
                            isSortable: true,
                            header: "history.table.download",
                            justify: "flex-end",
                        },
                        {
                            columnDef: "upload",
                            isSortable: true,
                            header: "history.table.upload",
                            justify: "flex-end",
                        },
                        {
                            columnDef: "ping",
                            isSortable: true,
                            header: "history.table.ping",
                            justify: "flex-end",
                        },
                    ]
                } else {
                    cols = [
                        {
                            columnDef: "count",
                            header: "#",
                            transformValue(value) {
                                return value.groupHeader ? "" : value.count
                            },
                        },
                        {
                            columnDef: "measurementDate",
                            header: "Time",
                        },
                        {
                            columnDef: "download",
                            header: "Download",
                            isHtml: true,
                        },
                        {
                            columnDef: "upload",
                            header: "Upload",
                            isHtml: true,
                        },
                        {
                            columnDef: "ping",
                            header: "Ping",
                            isHtml: true,
                        },
                        {
                            columnDef: "details",
                            header: "",
                            link: (id) =>
                                "/" +
                                ERoutes.TEST_RESULT.replace(":testUuid", id),
                            transformValue: (value) =>
                                value.groupHeader
                                    ? ""
                                    : this.transloco.translate("Details..."),
                        },
                    ]
                }
                return cols.filter(
                    (c) => !this.excludeColumns?.includes(c.columnDef)
                )
            })
        )
    env?: IEnv

    result$: Observable<{
        content: IHistoryRowONT[] | IHistoryRowRTR[]
        totalElements: number
    }> = of({ content: [], totalElements: 0 })

    sort$ = this.store.historySort$
    tableClassNames?: string[]

    constructor(
        private mainStore: MainStore,
        private store: HistoryStore,
        private transloco: TranslocoService
    ) {}

    ngOnInit(): void {
        this.result$ = this.store.getFormattedHistory(this.grouped).pipe(
            withLatestFrom(this.mainStore.env$),
            map(([history, env]) => {
                this.env = env ?? undefined
                if (this.env?.FLAVOR === "ont") {
                    this.tableClassNames = ["app-table--ont"]
                }
                return history
            })
        )
    }

    changeSort = (sort: ISort) => {
        this.sortChange.emit(sort)
    }

    toggleLoopResults(loopUuid: string) {
        const openLoops = this.store.openLoops$.value
        const index = openLoops.indexOf(loopUuid)
        if (index >= 0) {
            openLoops.splice(index, 1)
            this.store.openLoops$.next(openLoops)
        } else {
            this.store.openLoops$.next([...openLoops, loopUuid])
        }
    }
}
