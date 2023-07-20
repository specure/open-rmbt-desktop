import { Component, HostListener } from "@angular/core"

@Component({
    selector: "app-scroll-top",
    templateUrl: "./scroll-top.component.html",
    styleUrls: ["./scroll-top.component.scss"],
})
export class ScrollTopComponent {
    isVisible = false

    handleClick(event: MouseEvent) {
        document.querySelector("body")!.scrollTo({
            top: 0,
        })
    }

    @HostListener("body:scroll")
    onScroll() {
        const body = document.querySelector("app-main-content")
        if (!body) {
            return
        }
        const bodyTop = Math.abs(body.getBoundingClientRect().top)
        if (bodyTop >= window.innerHeight / 3) {
            this.isVisible = true
        } else {
            this.isVisible = false
        }
    }
}
