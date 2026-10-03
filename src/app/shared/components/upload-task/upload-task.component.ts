import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { FileManager } from 'src/app/stores/fileDrive.store';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss']
})
export class UploadTaskComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<UploadTaskComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public store:FileManager
  ) { }

  ngOnInit() {
    this.store.bottomSheetRef=this._bottomSheetRef;
  }

  openLink(event: MouseEvent): void {
    // this.store.uploading=false;
    // this._bottomSheetRef.dismiss();
    // event.preventDefault();
  }

  debug(item) {
  }

}
