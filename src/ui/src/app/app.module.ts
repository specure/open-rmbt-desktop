import { NgModule } from "@angular/core"
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
    // TimeScale,
    // TimeSeriesScale,
    // Decimation,
    Filler,
    // Title,
} from "chart.js"
import { HomeMetricsComponent } from "./widgets/home-metrics/home-metrics.component"
import { MainContentComponent } from "./widgets/main-content/main-content.component"
import { MainMenuComponent } from "./widgets/main-menu/main-menu.component"
import { MainMenuItemComponent } from "./widgets/main-menu-item/main-menu-item.component"
import { BodyComponent } from "./widgets/body/body.component"
import { ConfirmDialogComponent } from "./widgets/confirm-dialog/confirm-dialog.component"
import { MatDialogModule } from "@angular/material/dialog"
Chart.register(
    BarElement,
    BarController,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Filler
)

declare global {
    interface Window {
        electronAPI: {
            registerClient: () => Promise<IUserSettings>
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
            onError: (callback: (error: Error) => any) => Promise<any>
        }
    }
}

@NgModule({
    declarations: [
        AppComponent,
        BodyComponent,
        DlComponent,
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
        TestBoxesComponent,
        TestChartComponent,
        TestChartsComponent,
        TestHeaderComponent,
        TestIndicatorComponent,
        TestScreenComponent,
        ConfirmDialogComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        TranslocoRootModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
