import { Component, OnInit, Input } from '@angular/core';
import { driveObj } from 'src/app/dummy/status';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'file-info-name-doc',
  templateUrl: './file-info-name-doc.component.html',
  styleUrls: ['./file-info-name-doc.component.scss']
})
export class FileInfoNameDocComponent implements OnInit {

  @Input() selectedItem: any;

  DRIVE_OBJ = driveObj
  file: any;
  totalSize:number = 0;

  constructor(
    private ds: DataService
    ,public store: FileManager
    ,public auth: AuthStore
  ) { }

  ngOnInit() {
    if (this.selectedItem) {
      const { fileKey } = this.selectedItem;
      if (fileKey){
        this.ds.folderRef().doc(fileKey).valueChanges().subscribe((doc: any) => {
          this.file = doc || null;
        })
      }
      else {
       this.file=this.selectedItem;
      }
    }
  }

}
