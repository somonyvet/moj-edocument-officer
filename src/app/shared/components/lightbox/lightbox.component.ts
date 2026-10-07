import { Component, HostListener, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface LightboxAlbum {
  src: string;
  caption?: string;
  thumb?: string;
}

export interface LightboxOptions {
  wrapAround?: boolean;
  showImageNumberLabel?: boolean;
  showRotate?: boolean;
  centerVertically?: boolean;
}

export interface LightboxDialogData {
  albums: LightboxAlbum[];
  startIndex: number;
  options: LightboxOptions;
}

@Component({
    selector: 'app-lightbox',
    templateUrl: './lightbox.component.html',
    styleUrls: ['./lightbox.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LightboxComponent {
  index: number;
  rotation = 0;

  constructor(
    public dialogRef: MatDialogRef<LightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LightboxDialogData,
  ) {
    this.index = data.startIndex || 0;
  }

  get albums(): LightboxAlbum[] {
    return this.data.albums || [];
  }

  get current(): LightboxAlbum {
    return this.albums[this.index];
  }

  get canPrev(): boolean {
    return this.data.options?.wrapAround || this.index > 0;
  }

  get canNext(): boolean {
    return this.data.options?.wrapAround || this.index < this.albums.length - 1;
  }

  prev(): void {
    if (!this.canPrev) return;
    this.index = (this.index - 1 + this.albums.length) % this.albums.length;
    this.rotation = 0;
  }

  next(): void {
    if (!this.canNext) return;
    this.index = (this.index + 1) % this.albums.length;
    this.rotation = 0;
  }

  rotate(): void {
    this.rotation = (this.rotation + 90) % 360;
  }

  close(): void {
    this.dialogRef.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'Escape') this.close();
  }
}
