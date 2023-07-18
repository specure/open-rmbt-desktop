import { APP_INITIALIZER, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { HomeScreenComponent } from "./screens/home-screen/home-screen.component"
import { TestScreenComponent } from "./screens/test-screen/test-screen.component"
import { ResultScreenComponent } from "./screens/result-screen/result-screen.component"
import { HeaderComponent } from "./widgets/header/header.component"
import { FooterComponent } from "./widgets/footer/footer.component"
import { StartTestButtonComponent } from "./widgets/start-test-button/start-test-button.component"
import { GaugeComponent } from "./widgets/gauge/gauge.component"
import { InterimResultsComponent } from "./widgets/interim-results/interim-results.component"
import { DlComponent } from "./widgets/dl/dl.component"
import { SpacerComponent } from "./widgets/spacer/spacer.component"
import { IBasicNetworkInfo } from "../../../measurement/interfaces/basic-network-info.interface"
import { IMeasurementPhaseState } from "../../../measurement/interfaces/measurement-phase-state.interface"
import { ISimpleHistoryResult } from "../../../measurement/interfaces/simple-history-result.interface"
import { IUserSettings } from "../../../measurement/interfaces/user-settings-response.interface"
import { IEnv } from "../../../electron/interfaces/env.interface"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { HttpClientModule } from "@angular/common/http"
import { TranslocoRootModule } from "./transloco-root.module"
import { TestHeaderComponent } from "./widgets/test-header/test-header.component"
import { TestIndicatorComponent } from "./widgets/test-indicator/test-indicator.component"
import { TestBoxesComponent } from "./widgets/test-boxes/test-boxes.component"
import { TestChartComponent } from "./widgets/test-chart/test-chart.component"
import { TestChartsComponent } from "./widgets/test-charts/test-charts.component"
import { ICPU } from "../../../measurement/interfaces/cpu.interface"
import {
    Chart,
    // ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    // BubbleController,
    // DoughnutController,
    LineController,
    // PieController,
    // PolarAreaController,
    // RadarController,
    // ScatterController,
    CategoryScale,
    LinearScale,
    // LogarithmicScale,
    // RadialLinearScale,
    TimeScale,
    // TimeSeriesScale,
    // Decimation,
    Filler,
    // Title,
} from "chart.js"
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"
import { HomeMetricsComponent } from "./widgets/home-metrics/home-metrics.component"
import { MainContentComponent } from "./widgets/main-content/main-content.component"
import { MainMenuComponent } from "./widgets/main-menu/main-menu.component"
import { MainMenuItemComponent } from "./widgets/main-menu-item/main-menu-item.component"
import { BodyComponent } from "./widgets/body/body.component"
import { ConfirmDialogComponent } from "./widgets/confirm-dialog/confirm-dialog.component"
import { MatDialogModule } from "@angular/material/dialog"
import { ExportWarningComponent } from "./widgets/export-warning/export-warning.component"
import { TermsConditionsScreenComponent } from "./screens/terms-conditions-screen/terms-conditions-screen.component"
import { ICrowdinJson } from "../../../measurement/interfaces/crowdin.interface"
import { INewsItem } from "../../../measurement/interfaces/news.interface"
import { SettingsScreenComponent } from "./screens/settings-screen/settings-screen.component"
import { NewsScreenComponent } from "./screens/news-screen/news-screen.component"
import { MatTableModule } from "@angular/material/table"
import { MatSortModule } from "@angular/material/sort"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSlideToggleModule } from "@angular/material/slide-toggle"
import { MatSelectModule } from "@angular/material/select"
import { TableComponent } from "./widgets/table/table.component"
import { PaginatorComponent } from "./widgets/paginator/paginator.component"
import { DynamicComponentDirective } from "./directives/dynamic-component.directive"
import { SettingsUuidComponent } from "./widgets/settings-uuid/settings-uuid.component"
import { SettingsVersionComponent } from "./widgets/settings-version/settings-version.component"
import { SettingsRepoLinkComponent } from "./widgets/settings-repo-link/settings-repo-link.component"
import { SettingsIpComponent } from "./widgets/settings-ip/settings-ip.component"
import { SettingsLocaleComponent } from "./widgets/settings-locale/settings-locale.component"
import { FormsModule } from "@angular/forms"
import { EIPVersion } from "../../../measurement/enums/ip-version.enum"
import { MainStore } from "./store/main.store"
import { HistoryScreenComponent } from "./screens/history-screen/history-screen.component"
import { ActionButtonsComponent } from "./widgets/action-buttons/action-buttons.component"
import { ScrollTopComponent } from "./widgets/scroll-top/scroll-top.component"
import localeDe from "@angular/common/locales/de"
import { DatePipe, registerLocaleData } from "@angular/common"

Chart.register(
    BarElement,
    BarController,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    TimeScale,
    Filler
)

declare global {
    interface Window {
        electronAPI: {
            quit: () => Promise<void>
            getTranslations: (lang: string) => Promise<ICrowdinJson | null>
            getNews: () => Promise<INewsItem[] | null>
            acceptTerms: (terms: string) => Promise<void>
            registerClient: () => Promise<IUserSettings>
            setIpVersion: (ipv: EIPVersion | null) => Promise<void>
            setLanguage: (language: string) => Promise<void>
            runMeasurement: () => Promise<void>
            abortMeasurement: () => Promise<void>
            getEnv: () => Promise<IEnv>
            getCPUUsage: () => Promise<ICPU>
            getMeasurementState: () => Promise<
                IMeasurementPhaseState & IBasicNetworkInfo
            >
            getMeasurementResult: (
                testUuid: string
            ) => Promise<ISimpleHistoryResult>
            getMeasurementHistory: (
                offset?: number,
                limit?: number
            ) => Promise<ISimpleHistoryResult[]>
            onError: (callback: (error: Error) => any) => Promise<any>
            onOpenSettings: (callback: () => any) => Promise<any>
        }
    }
}

@NgModule({
    declarations: [
        AppComponent,
        BodyComponent,
        DlComponent,
        ExportWarningComponent,
        FooterComponent,
        GaugeComponent,
        HeaderComponent,
        HomeMetricsComponent,
        HomeScreenComponent,
        InterimResultsComponent,
        MainContentComponent,
        MainMenuComponent,
        MainMenuItemComponent,
        ResultScreenComponent,
        SpacerComponent,
        StartTestButtonComponent,
        TableComponent,
        TestBoxesComponent,
        TestChartComponent,
        TestChartsComponent,
        TestHeaderComponent,
        TestIndicatorComponent,
        TestScreenComponent,
        ConfirmDialogComponent,
        TermsConditionsScreenComponent,
        NewsScreenComponent,
        SettingsScreenComponent,
        PaginatorComponent,
        SettingsUuidComponent,
        SettingsVersionComponent,
        SettingsRepoLinkComponent,
        DynamicComponentDirective,
        SettingsIpComponent,
        SettingsLocaleComponent,
        HistoryScreenComponent,
        ActionButtonsComponent,
        ScrollTopComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatSelectModule,
        TranslocoRootModule,
    ],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: MainStore.factory,
            deps: [MainStore],
            multi: true,
        },
        {
            provide: DatePipe,
        },
    ],
})
export class AppModule {
    constructor() {
        registerLocaleData(localeDe)
    }
}
