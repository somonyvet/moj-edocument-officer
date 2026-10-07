import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LightboxAlbum, LightboxComponent, LightboxOptions } from '../components/lightbox/lightbox.component';

@Injectable({ providedIn: 'root' })
export class Lightbox {
  constructor(private dialog: MatDialog) { }

  open(albums: LightboxAlbum[], startIndex: number = 0, options: LightboxOptions = {}) {
    return this.dialog.open(LightboxComponent, {
      data: { albums, startIndex, options },
      panelClass: 'lightbox-dialog-panel',
      backdropClass: 'lightbox-dialog-backdrop',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });
  }
}
