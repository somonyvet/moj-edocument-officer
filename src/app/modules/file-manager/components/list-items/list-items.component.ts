import { Component, OnInit, ViewChild, HostListener, TemplateRef, ViewContainerRef, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, fromEvent, Observable } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter, take } from 'rxjs/operators';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { FileTag } from 'src/app/stores/fileTag.store';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from 'src/app/shared/services/data.service';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';

import { driveObj } from 'src/app/dummy/status';
import { IPath } from 'src/app/interfaces/file-manager';

import { UploadTaskComponent } from '../../../../shared/components/upload-task/upload-task.component';
import { DeleteComponent } from '../../../../shared/components/delete/delete.component';
import { OpenFileComponent } from '../open-file/open-file.component';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.scss']
})

export class ListItemsComponent implements OnInit {

  @ViewChild('contextMenu') contextMenu: MatMenuTrigger;
  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  @Output() rid = new EventEmitter<string>();

  @Input() hideProvince:boolean=false;
  @Input() selectedOpenFile: any = null;
  @Input() selectedCompany: any = null;
  @Input() user: any = null;
  @Input() sharedRef:any=false;

  TITLE: any = "Recent"
  APP_IMG = ''
  APP_INFO = ''
  APP_SUBTITLE = ''
  totalSize: number = 0
  routeID: any;
  DRIVE_OBJ = driveObj

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  item: any;
  toggleActive = false;
  ismobile = false;
  setting: any;
  snackBar: any;
  sub: Subscription;
  tagColor: any;
  orifile: any;
  parentFolder = "my_files";
  overlayRef: OverlayRef | null;
  parentPath: any;
  totalPath: any;
  queryParams: any = null;
  activeParams: any = null;

  constructor(
    public store: FileManager
    , public auth: AuthStore
    , private ds: DataService
    , public router: Router
    , private dialog: MatDialog
    , private sidenav: SideNavService
    , public breakpointObserver: BreakpointObserver
    , public tagcolor: FileTag
    , private route: ActivatedRoute
    , public overlay: Overlay
    , public viewContainerRef: ViewContainerRef
  ) { }

  async ngOnInit() {
    this.parentPath = this.router.url.split('/')[1];
    this.totalPath = this.router.url.split('/').length;
    this.ds.currentIDMessage.subscribe(f => this.routeID = f)
    this.ds.currentMessage.subscribe(messaging => this.totalSize = messaging)

    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
      });

    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      const { p } = queryParams;
      this.route.params.subscribe(async param => {
        this.store.data=[];
        const { id } = param;
        this.activeParams = id;
        const { selectedCompany, user, root } = this.auth;
        let partData: any[] = [];
        let path: IPath = null;
        this.store.selectedItem = null;
        this.store.selectedOpenItem = null;
        if (id) {
          await this.store.fetchSelectedDrive(selectedCompany.key, id);
          const { currentPath, key, name, path, isDelete, isFavorite, fileTag, type, created_by, isMyFile } = this.store.selectedOpenItem;
          path.push({
            key, name,
            path: `/my_files/${id}`,
            isDelete, isFavorite, fileTag, type, created_by,
            isMyFile: false
          })
          partData = path;
        }
        else {
          switch (this.router.url) {
            case '/shared-with-me':
              path = {
                key: 'shared_with_me',
                name: 'Shared with me',
                name_en: 'Shared with me',
                path: '/shared-with-me',
                isMyFile: false,
              }
              break;
            default:
              path = {
                key: 'my_files',
                name: 'បណ្ណសារដ្ឋាន',
                name_en: 'My Files',
                path: '/my_files',
                isMyFile: true,
              }
              break;
          }
          partData.push(path)
        }

        this.store.fetchPath(partData)

        const { selectedOpenItem } = this.store;
        switch (this.router.url) {
          // case '/pinned-board':
          //   this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
          //   this.APP_INFO = `No pinned board files.`
          //   this.APP_SUBTITLE = 'Add pinned board from share file and allow all user and company to see it.'
          //   this.store.fetchPinnedBoard(docs => { this.data = docs })
          //   break;

          case '/public-shared':
            this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
            this.APP_INFO = `ពុំមានឯកសារប្រកាសឬសេចក្ដីជូនដំណឹង`
            this.APP_SUBTITLE = 'ប្រអប់នេះប្រើសំរាប់ចែកចាយឯកសារពីអគ្គស្នងការដ្ឋាននគរបាលជាតិនៅស្នងការរាជធានី/ខេត្'
            this.store.fetchPublicShared(selectedCompany.key, user.uid)
            // this.store.fetchFileData(selectedCompany.key, partData[partData.length - 1], root, p || null)
            break;

          case '/shared-with-other':
            this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
            this.APP_INFO = `ពុំមានឯកសារប្រកាសឬសេចក្ដីជូនដំណឹង`
            this.APP_SUBTITLE = 'ប្រអប់នេះប្រើសំរាប់ចែកចាយឯកសារពីអគ្គស្នងការដ្ឋាននគរបាលជាតិនៅស្នងការរាជធានី/ខេត្ត'
            this.store.fetchSharedWithOther(selectedCompany.key, user.uid)
            // this.store.fetchFileData(selectedCompany.key, partData[partData.length - 1], root)
            break;

          // case '/shared-with-me':

          //   this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
          //   this.APP_INFO = `No file shared with you.`
          //   this.APP_SUBTITLE = 'Files and folders others have shared with you.'
          //   this.store.fetchSharedWithMe(selectedCompany.key, user.uid, selectedOpenItem, partData[partData.length - 1], docs => {
          //     this.data = docs
          //   })
          //   break;

          case '/favorite':
            this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
            this.APP_INFO = `No starred files or folders.`
            this.APP_SUBTITLE = 'Add stars to things that you want to easily find later.'
            this.store.fetchFavoriteData(selectedCompany.key, user,)
            // this.store.fetchFileData(selectedCompany.key, partData[partData.length - 1], root, p || null)
            break;
          case '/my_files':
            this.APP_INFO = `File Manager lets you access your stuff on every computer and mobile device.`
            this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Ffolder.svg?alt=media&token=75877285-6cf8-40d6-a96b-711684c78f75`
            this.APP_SUBTITLE = `Drag file here or add files by using the "New" button.`
            this.store.fetchData(selectedCompany.key, user, root, selectedOpenItem, partData[partData.length - 1], p || null, queryParams.children_docs || null)
            this.store.fetchFileData(selectedCompany.key, partData[partData.length - 1], root, p || null)
            break;
          default:
            this.APP_INFO = `ពុំមានឯកសារ`
            this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Ffolder.svg?alt=media&token=75877285-6cf8-40d6-a96b-711684c78f75`
            this.APP_SUBTITLE = null,
              this.store.fetchData(selectedCompany.key, user, root, selectedOpenItem, partData[partData.length - 1], p || null, queryParams.children_docs || null)
            this.store.fetchFileData(selectedCompany.key, partData[partData.length - 1], root, p || null)
            break;
        }
      })
    })
  }

  fetchSelectedFile(file, dialog, user, company) {
    this.store.fetchSelectedFile(file, dialog, user, company)
  }


  clearFilter() {
    this.router.navigate([`/my_files/${this.activeParams}`])
  }

  ngOnDestroy() {
    const { fetchDataRef, fetchFileDataRef, myFileSubscript } = this.store;
    fetchDataRef && fetchDataRef.unsubscribe();
    fetchFileDataRef && fetchFileDataRef.unsubscribe();
    myFileSubscript && myFileSubscript.unsubscribe();
  }

  rightMenu({ x, y }: MouseEvent, item: any, isSelected?: boolean) {
    this.close();
    const { selectedItem, selectedOpenItem } = this.store;
    this.store.selectedOpenItem = isSelected ? selectedOpenItem : item;
    this.store.selectedItem = isSelected ? item : selectedItem;
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

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  closeEvent(ev) {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  restore(item: any) {
    this.store.RestoreFile(item, this.auth.user, async (success) => {
      if (success) {
        const foundResult = await this.store.getAllRelatedFileOrFolder(item.key);

        await Promise.all(foundResult.map(async (item) => {
          await this.store.RestoreFile0(item, this.auth.User);
        }));

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

  // if (fileRef) {
  //   fileRef.get().then(doc => {
  //     this.FILE = doc.data();
  //     const { user, pin, publicShare,
  //       permission
  //     } = this.data;
  //     const filePermission = this.PERMISSION_OPTIONS.find(m => m.key === permission.key)
  //     this.form.patchValue({
  //       pin, publicShare, permission: filePermission,
  //     })
  //     this.SELECTED_USER = user;
  //   });
  // }

  onOpenItem(item: any) {
    const { type, shareRef, fileRef } = item;
    this.store.selectedItem = item;
    let folderName: any = 'my_files';
    if (fileRef) {
      fileRef.get().then(doc => {
        this.orifile = doc.data();
        if (this.orifile.type.key === driveObj.file.key) {
          this.dialog.open(OpenFileComponent, {
            data: { ITEM: this.orifile },
            width: '100vw',
            height: '100vh',
            panelClass: 'open-file-panel',
            role: 'dialog',
          });
          return;
        }
        this.router.navigate([`/${folderName}/${this.orifile.key}`, {}])
      })
    } else {
      if (type.key === driveObj.file.key) {
        let openByIFrame: boolean = true;
        this.dialog.open(OpenFileComponent, {
          data: { ITEM: item, openByIFrame },
          width: '100vw',
          height: '100vh',
          panelClass: 'open-file-panel',
          role: 'dialog',
        });
        return;
      }
      this.router.navigate([`/${folderName}/${item.key}`], { queryParams: this.queryParams })
    }


  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
  }

  async onSelectedItem(item: any) {
    this.store.selectedItem = item;
    this.totalSize = 0;
    const f = await this.store.getFolderSize(item)
    f.forEach(s => {
      if (s.type.key === "file") {
        this.totalSize += s.size
      }
    });
    this.ds.changeMessage(this.totalSize)
    return this.totalSize
  }

}
