import { Injectable, EventEmitter, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root'
})
export class SideNavService {
    private sidenav: MatSidenav;

    public setSidenav(sidenav: MatSidenav) {
        this.sidenav = sidenav;
        if(!this.sidenav) return
        const isToggle = localStorage.getItem('isToggled')
        const tg = isToggle == 'true' ? true : false
        if (tg) {
            this.sidenav.open()
        } else {
            this.sidenav.close()
        }

    }

    public open() {
        if(!this.sidenav) return;
        return this.sidenav.open();
    }


    public close() {
        if(!this.sidenav) return;
        return this.sidenav.close();
    }

    public toggle(): void {
        if(!this.sidenav) return;
        this.sidenav.toggle();
        localStorage.setItem('isToggled', JSON.stringify(this.sidenav.opened))
    }
}
