import { ChangeDetectorRef, Component, OnInit } from "@angular/core"
import { TranslocoService } from "@ngneat/transloco"
import { map, switchMap, takeUntil, withLatestFrom } from "rxjs"
import { UNKNOWN } from "src/app/constants/strings"
import { CMSService } from "src/app/services/cms.service"
import { MessageService } from "src/app/services/message.service"
import { MainStore } from "src/app/store/main.store"
import { BaseScreen } from "../base-screen/base-screen.component"

@Component({
    selector: "app-home-screen",
    templateUrl: "./home-screen.component.html",
    styleUrls: ["./home-screen.component.scss"],
})
export class HomeScreenComponent extends BaseScreen implements OnInit {
    env$ = this.mainStore.env$
    ipInfo$ = this.mainStore.settings$.pipe(
        withLatestFrom(this.mainStore.isOnline$),
        map(([settings, isOnline]) => {
            setTimeout(() => this.cdr.detectChanges(), 100)
            if (settings?.ipInfo && isOnline) {
                const { publicV4, publicV6, privateV4, privateV6 } =
                    settings?.ipInfo
                return [
                    `${this.transloco.translate("IPv4")}:&nbsp;${this.getIPIcon(
                        publicV4,
                        privateV4
                    )}&nbsp;${publicV4}`,
                    `${this.transloco.translate("IPv6")}:&nbsp;${this.getIPIcon(
                        publicV6,
                        privateV6
                    )}&nbsp;${publicV6}`,
                ]
            }
            return [
                `${this.transloco.translate("IPv4")}:&nbsp;${this.getIPIcon(
                    UNKNOWN,
                    UNKNOWN
                )}`,
                `${this.transloco.translate("IPv6")}:&nbsp;${this.getIPIcon(
                    UNKNOWN,
                    UNKNOWN
                )}`,
            ]
        })
    )
    jitterInfo$ = this.mainStore.jitterInfo$.pipe(
        map((info) => {
            if (info) {
                const { jitter, packetLoss, ping } = info
                return [
                    `${this.transloco.translate(
                        "Ping"
                    )}:&nbsp;${ping} ${this.transloco.translate("ms")}`,
                    `${this.transloco.translate(
                        "Packet loss"
                    )}:&nbsp;${packetLoss}%`,
                    `${this.transloco.translate("Jitter")}:&nbsp;${jitter}`,
                ]
            } else {
                return [
                    `${this.transloco.translate("Ping")}:&nbsp;${UNKNOWN}`,
                    `${this.transloco.translate(
                        "Packet loss"
                    )}:&nbsp;${UNKNOWN}`,
                    `${this.transloco.translate("Jitter")}:&nbsp;${UNKNOWN}`,
                ]
            }
        })
    )
    testInviteImg$ = this.mainStore.env$.pipe(
        switchMap((env) =>
            this.cmsService.getAssetByName(
                `test-invite-img.${env?.X_NETTEST_CLIENT}.svg`
            )
        )
    )
    showProgress = true
    methodologyLink$ = this.cmsService.getProject().pipe(
        map(() => {
            const path = "methodology"
            let lang = this.transloco.getActiveLang()
            if (!["en", "de"].includes(lang)) {
                lang = "en"
            }
            return `${this.env$.value?.WEBSITE_HOST}/${lang}/${path}`
        })
    )

    constructor(
        mainStore: MainStore,
        message: MessageService,
        private cdr: ChangeDetectorRef,
        private cmsService: CMSService,
        private transloco: TranslocoService
    ) {
        super(mainStore, message)
    }

    ngOnInit(): void {
        this.mainStore.registerClient(navigator.onLine)
        this.mainStore
            .startLoggingJitter()
            .pipe(takeUntil(this.destroyed$))
            .subscribe()
        this.showProgress = false
    }

    getIPIcon(publicAddress: string, privateAddress: string) {
        const t = (str: string) => this.transloco.translate(str)
        if (publicAddress === UNKNOWN) {
            return `<i title="${t(
                "Unknown"
            )}" class="app-icon--class app-icon--class-gray"></i>`
        } else if (!publicAddress) {
            return `<i title="${t(
                "No connectivity"
            )}" class="app-icon--class app-icon--class-red"></i>`
        } else if (publicAddress !== privateAddress) {
            return `<i title="${t(
                "NAT"
            )}" class="app-icon--class app-icon--class-yellow"></i>`
        } else {
            return `<i title="${t(
                "Public IP"
            )}" class="app-icon--class app-icon--class-green"></i>`
        }
    }
}
