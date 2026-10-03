import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { filter, take } from 'rxjs/operators';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';

import { IPath } from 'src/app/interfaces/file-manager';
import { driveObj } from 'src/app/dummy/status';

import { DataService } from 'src/app/shared/services/data.service';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';
import { UploadTaskComponent } from 'src/app/shared/components/upload-task/upload-task.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';

import { OpenFileComponent } from '../../components/open-file/open-file.component';
import { NewFolderComponent } from '../../components/new-folder/new-folder.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;
  // @ViewChild('contextMenu') contextMenu: MatMenuTrigger;
  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  TITLE: any = "Recent"
  APP_INFO = `This folder is empty.`
  DRIVE_OBJ = driveObj
  toggleActive = false;
  isMobile = false;
  setting: any;
  snackBar: any;
  parentPath: any = 'my_files'
  loading: boolean = true;

  APP_IMG = ''
  APP_SUBTITLE = ''
  totalSize: number = 0
  routeID: any;

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  item: any;
  sub: Subscription;

  tagColor: any;
  orifile: any;
  parentFolder = "my_files";

  overlayRef: OverlayRef | null;
  totalPath: any;
  queryParams: any = null;
  activeParams: any = null;

  constructor(
    public store: FileManager
    , public auth: AuthStore
    , private router: Router
    , private dialog: MatDialog
    , private sidenavService: SideNavService
    , public breakpointObserver: BreakpointObserver
    , private ds: DataService
    , private route: ActivatedRoute,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    private changeRef: ChangeDetectorRef,

  ) { }

  async ngOnInit() {
    this.parentPath = this.router.url.split('/')[2];
    this.totalPath = this.router.url.split('/').length;
    this.ds.currentIDMessage.subscribe(f => this.routeID = f)
    this.ds.currentMessage.subscribe(messaging => this.totalSize = messaging)

    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = state.matches;
        } else {
          this.isMobile = state.matches;
        }
      });

    this.route.params.subscribe(async params => {
      this.loading = true;
      const { id } = params;
      this.activeParams = params;

      this.route.queryParams.subscribe(async queryParams => {
        this.loading = true;
        this.queryParams = queryParams;
        const { p } = queryParams;
        const { selectedCompany, user, root } = this.auth;
        let partData: any[] = [];
        let path: IPath = null;
        this.store.selectedItem = null;
        this.store.selectedOpenItem = null;

        if (id) {
          await this.store.fetchSelectedDrive(selectedCompany.key, id);
          const { key, name, path, isDelete, isFavorite, fileTag, type, created_by } = this.store.selectedOpenItem;
          path.push({
            key, name,
            path: `/my_files/${id}`,
            isDelete, isFavorite, fileTag, type, created_by,
            isMyFile: false
          })
          partData = path;
        } else {
          path = {
            key: 'my_files',
            name: 'បណ្ណសារដ្ឋាន',
            name_en: 'My Files',
            path: '/my_files',
            isMyFile: true,
          }
          partData.push(path)
        }

        this.store.fetchPath(partData)
        const { selectedOpenItem } = this.store;

        this.APP_INFO = `File Manager lets you access your stuff on every computer and mobile device.`
        this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Ffolder.svg?alt=media&token=75877285-6cf8-40d6-a96b-711684c78f75`
        this.APP_SUBTITLE = `Drag file here or add files by using the "New" button.`;


        this.store.fetchData(selectedCompany.key, user, root, selectedOpenItem, partData[partData.length - 1], p || null, queryParams.children_docs || null, res => {
          this.loading = false;
        });
      })
    })
  }

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  ngOnDestroy() {
    const { fetchDataRef, fetchFileDataRef, myFileSubscript } = this.store;
    fetchDataRef && fetchDataRef.unsubscribe();
    fetchFileDataRef && fetchFileDataRef.unsubscribe();
    myFileSubscript && myFileSubscript.unsubscribe();
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

  closeEvent(ev) {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  fetchSelectedFile(file, dialog, user, company) {
    this.store.fetchSelectedFile(file, dialog, user, company)
  }

  onOpenItem(item: any) {
    const { type } = item;
    this.store.selectedItem = item;
    if (type.key === driveObj.file.key) {
      const { fileType, downloadURL } = item;
      let openByIFrame: boolean = true;
      if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL, "_blank");
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
    this.router.navigate([`/file-manager/${this.parentPath}/${item.key}`, {}])
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
  }

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  rightMenu({ x, y }: MouseEvent, item: any, isSelected: boolean) {
    this.close();
    this.store.selectedItem = item ? item : null;
    this.store.isSelectedFile = isSelected;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, {
      $implicit: item
    }));

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe(() => this.close())
  }


  clearFilter() {
    this.router.navigate([`/my_files/${this.activeParams}`])
  }

}
