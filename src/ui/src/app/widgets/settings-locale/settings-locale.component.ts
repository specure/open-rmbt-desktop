import { Component } from "@angular/core"
import { MatSelectChange } from "@angular/material/select"
import { TranslocoService } from "@ngneat/transloco"
import { ILocale } from "src/app/interfaces/locale.interface"
import { TranslocoConfigExt } from "src/transloco.config"

@Component({
    selector: "app-settings-locale",
    templateUrl: "./settings-locale.component.html",
    styleUrls: ["./settings-locale.component.scss"],
})
export class SettingsLocaleComponent {
    locales = TranslocoConfigExt["availableLocales"]
    selectedLocale = this.locales.find(
        (l: ILocale) => l.iso === this.transloco.getActiveLang()
    )

    constructor(private transloco: TranslocoService) {}

    change(event: MatSelectChange) {
        console.log(event.value.iso)
        this.transloco.setActiveLang(event.value.iso)
        window.electronAPI.setActiveLanguage(event.value.iso)
    }
}
