import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { driveObj } from 'src/app/dummy/status';

@Component({
    selector: 'app-open-file',
    templateUrl: './open-file.component.html',
    styleUrls: ['./open-file.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OpenFileComponent implements OnInit {

  msg: any;
  DRIVE_OBJ = driveObj
  LOADING: boolean = true;

  @ViewChild('iframe') iframe: ElementRef

  constructor(
    public dialogRef: MatDialogRef<OpenFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const { ITEM } = this.data;
    this.msg = ITEM;
  }

  ngAfterViewInit() {
    // const { ITEM } = this.data;
    // this.iframe.nativeElement.setAttribute('src', ITEM.downloadURL);
  }

  onClose() {
    this.dialogRef.close()
  }
  onLoaded(event) {
    this.LOADING = false;
  }

  onDownload() {
    const { ITEM } = this.data;
    window.open(ITEM.downloadURL, "_blank");

  }
}
