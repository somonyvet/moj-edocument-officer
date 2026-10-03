import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';

import { driveObj } from 'src/app/dummy/status';
import { IPath } from 'src/app/interfaces/file-manager';

import { OpenFileComponent } from '../../components/open-file/open-file.component';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';

@Component({
  selector: 'app-folder-list',
  templateUrl: './folder-list.component.html',
  styleUrls: ['./folder-list.component.scss']
})
export class FolderListComponent implements OnInit {

  // @ViewChild(MatMenuTrigger, null)
  // private contextMenu: MatMenuTrigger;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  TITLE: any = "Recent"
  APP_INFO = `This folder is empty.`
  DRIVE_OBJ=driveObj
  toggleActive = false;
  ismobile = false;
  setting: any;
  snackBar: any;
  parentPath:any="my_files";

  constructor(
    public store: FileManager
    , public auth: AuthStore
    , private router: Router
    , private dialog: MatDialog
    , private sidenavService: SideNavService
    , public breakpointObserver: BreakpointObserver
    , private route: ActivatedRoute) { }

  async ngOnInit() {
    this.parentPath=this.router.url.split('/')[1];
    this.sidenavService.setSidenav(this.sidenav);
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
      });

    this.route.params.subscribe(async param => {
      const { id } = param;

      const { selectedCompany, user } = this.auth;
      let partData: any[] = [];
      this.store.selectedItem = null;

      if (id) {
        await this.store.fetchSelectedDrive(selectedCompany.key, id);
        const { currentPath, key, name, path } = this.store.selectedOpenItem
        path.push({ key, name, path: `/my_files/${id}` })
        partData = path;
      }
      else {
        const path: IPath = {
          key: 'my_files',
          name: 'បណ្ណសារដ្ឋាន',
          name_en: 'My Files',
          path: '/my_files'
        }
        partData.push(path)
      }

      this.store.fetchPath(partData);

      // this.store.fetchData(selectedCompany.key, user, partData[partData.length - 1],f => { })
    })
  }

  ngOnDestroy() {
    const { fetchDataRef } = this.store;
    fetchDataRef && fetchDataRef.unsubscribe();
  }

  restore(item: any) {
    this.store.RestoreFile(item, this.auth.user, (success) => {
      if (success) {
        switch (item.type.key) {
          case 'file':
            this.snackBar.open("File has been restored successfully.", "Done", { duration: 3000 });
            return;
          case 'folder':
            this.snackBar.open("Folder has been restored successfully.", "Done", { duration: 3000 });
            return;
          default:
            this.snackBar.open("File has been restored suxwccessfully.", "Done", { duration: 3000 });
            return;
        }
      } else {
        this.snackBar.open("Fail to restored file.", "Done", { duration: 3000 });
      }
    })
  }


  onScroll() {

  }

  onOpenItem(item: any) {
    const { type } = item;
    this.store.selectedItem = item;
    if (type.key === driveObj.file.key) {
      const { fileType,downloadURL } = item;
      let openByIFrame: boolean = true;
      if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL , "_blank");
        return;
      };
      this.dialog.open(OpenFileComponent, {
        data: { ITEM: item, openByIFrame },
        // data: item ? item : null,
        width: '80vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    this.router.navigate([`/${this.parentPath}/${item.key}`,{}])
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
}


}
