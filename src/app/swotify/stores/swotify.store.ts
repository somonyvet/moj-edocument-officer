import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { SwotifyService } from "../services/swotify.service";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SwotifyStore {
    @observable toggleMainL: boolean = false;
    @observable module: any = null;
    @observable newButtonName: string = `New account`;
    @observable componentDialog: any = null;

    constructor(private ds: SwotifyService,
        private dialog: MatDialog) { }


    @action
    onCreate(item?: any) {
        if (this.componentDialog) {
            const dialogRef = this.dialog.open(this.componentDialog, {
                data: { item: item || null },
                panelClass: 'cs-dialog-wrapper',
                width: '580px',
                height: '96vh',
                disableClose: true,
                role: 'dialog',
            });
            dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
            return;
        }
    }

}
