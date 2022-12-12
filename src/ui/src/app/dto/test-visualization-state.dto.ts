import { ITestVisualizationState } from "../interfaces/test-visualization-state.interface"
import { ITestItemState } from "../interfaces/test-item-state.interface"
import { EMeasurementStatus } from "../../../../measurement/enums/measurement-status.enum"
import { ITestPhaseState } from "../../../../measurement/interfaces/test-phase-state.interface"
import { extend } from "../helpers/extend"
import { ETestStatuses } from "../enums/test-statuses.enum"

export class TestItemState implements ITestItemState {
    chart?: { x: number; y: number }[] | undefined
    container?: ETestStatuses | undefined
    label?: string | undefined
    duration: number = 0
    progress: number = 0
    value: number = -1
    phase: EMeasurementStatus = EMeasurementStatus.NOT_STARTED
}

export class TestVisualizationState implements ITestVisualizationState {
    phases: {
        [key: string]: ITestItemState
    } = {
        [EMeasurementStatus.NOT_STARTED]: new TestItemState(),
        [EMeasurementStatus.WAIT]: new TestItemState(),
        [EMeasurementStatus.INIT]: new TestItemState(),
        [EMeasurementStatus.INIT_DOWN]: new TestItemState(),
        [EMeasurementStatus.PING]: new TestItemState(),
        [EMeasurementStatus.DOWN]: new TestItemState(),
        [EMeasurementStatus.INIT_UP]: new TestItemState(),
        [EMeasurementStatus.END]: new TestItemState(),
    }
    currentPhase: EMeasurementStatus = EMeasurementStatus.NOT_STARTED

    static from(
        initialState: ITestVisualizationState,
        phaseState: ITestPhaseState
    ) {
        const newState = extend<ITestVisualizationState>(initialState)
        newState.phases[phaseState.phase] = extend<ITestItemState>(
            newState.phases[phaseState.phase],
            phaseState
        )
        return newState
    }

    extendChart(key: string, counter: string | number, progress: number) {
        return [
            ...(this.phases[key]?.chart || []),
            {
                x: progress,
                y: counter === "-" ? 0 : (counter as number),
            },
        ]
    }
}
