import { Component, OnInit, Input } from '@angular/core';
import { driveObj } from 'src/app/dummy/status';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/shared/services/data.service';
import { OpenFileComponent } from '../open-file/open-file.component';

@Component({
  selector: 'file-name-doc',
  templateUrl: './file-name-doc.component.html',
  styleUrls: ['./file-name-doc.component.scss']
})
export class FileNameDocComponent implements OnInit {

  @Input() noEye: any = false;
  @Input() item: any;
  @Input() selectedItem: any;
  @Input() parentFolder: any;

  DRIVE_OBJ = driveObj
  file: any;
  folderRef: any = null;

  constructor(
    private ds: DataService
    , public store: FileManager
    , private dialog: MatDialog
    , private router: Router
    , public auth: AuthStore

  ) { }

  async ngOnInit():Promise<void> {
    if (this.item) {
      const { fileKey } = this.item;
      if (fileKey) {
       const doc=await this.ds.folderRef().doc(fileKey).get().toPromise();
       this.file = doc || null;
      } else {
        this.file = this.item;
      }
    }


  }

  ngOnDestroy() {
    this.folderRef && this.folderRef.unsubscribe();
  }

  onOpenItem() {
    if (!this.file) return;
    const { type } = this.file;
    this.store.selectedItem = this.file;

    //if open file
    if (type.key === driveObj.file.key) {
      const { fileType, downloadURL } = this.file;
      let openByIFrame: boolean = true;

      if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL, "_blank");
        return;
      };

      this.dialog.open(OpenFileComponent, {
        data: { ITEM: this.file, openByIFrame },
        width: '80vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });

      return;
    }

    //if open folder

    if (this.parentFolder == 'my_files') this.parentFolder = 'file-manager/my_files'
    this.router.navigate([`/${this.parentFolder || 'my_files'}/${this.file.key}`])
  }

}
