import { Component, OnInit, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { driveObj } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';

@Component({
    selector: 'app-file-info',
    templateUrl: './file-info.component.html',
    styleUrls: ['./file-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FileInfoComponent implements OnInit {

  @Input() selectedItem: any;

  file: any;

  DRIVE_OBJ = driveObj
  ismobile = false;
  toggleActive = false;
  mySubscription: any;
  totalSize: number = 0;

  constructor(
    public store: FileManager,
    public sidenav: SideNavService,
    public auth: AuthStore,
    private ds: DataService
  ) { }

  ngOnInit() {
    if (this.selectedItem) {
      const { fileKey } = this.selectedItem;

      if (fileKey) {
        this.ds.folderRef().doc(fileKey).valueChanges().subscribe((doc: any) => {
          this.file = doc || null;
        })
      }
      else {
        this.file = this.selectedItem;
      }
    }

    this.ds.currentMessage.subscribe(message => this.totalSize = message)
    // this.getInfo(this.store?.selectedItem)
  }

  onDownload() {
    const ITEM = this.store.selectedItem;
    if(!ITEM) return;
    window.open(ITEM.downloadURL, "_blank");
  }

  ngOnDestroy() {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
  }

}
