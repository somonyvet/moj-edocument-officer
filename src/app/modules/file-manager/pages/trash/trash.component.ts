import { Component, OnInit, ViewChild, TemplateRef, ViewContainerRef, ChangeDetectorRef, OnDestroy, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter, take } from 'rxjs/operators';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { driveObj } from 'src/app/dummy/status';
import { IPath } from 'src/app/interfaces/file-manager';
import { FileTag } from 'src/app/stores/fileTag.store';
import { UploadTaskComponent } from 'src/app/shared/components/upload-task/upload-task.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';
import { NewFolderComponent } from '../../components/new-folder/new-folder.component';

@Component({
    selector: 'app-trash',
    templateUrl: './trash.component.html',
    styleUrls: ['./trash.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class TrashComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {

  TITLE: any = "ធុងសំរាម"
  APP_IMG = ''
  APP_INFO = ''
  APP_SUBTITLE = ''
  totalSize: number = 0
  DRIVE_OBJ = driveObj

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  item: any;
  toggleActive = false;
  ismobile = false;

  setting: any;
  sub: Subscription;
  tagColor: any;
  trashData: any;

  @ViewChild('contextMenu') contextMenu: MatMenuTrigger;
  @ViewChild('sidenav') public sidenav: MatSidenav;
  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  overlayRef: OverlayRef | null;
  loading: boolean = true;

  constructor(
    public store: FileManager
    , public auth: AuthStore
    , private ds: DataService
    , private snackBar: MatSnackBar
    , private sidenavService: SideNavService
    , public breakpointObserver: BreakpointObserver
    , public tagcolor: FileTag
    , private route: ActivatedRoute
    , public overlay: Overlay
    , public viewContainerRef: ViewContainerRef,
    private changeRef: ChangeDetectorRef

  ) { }

  async ngOnInit() {

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

    this.route.params.subscribe(async param => {
      const { id } = param;

      const { selectedCompany, user } = this.auth;
      let partData: any[] = [];
      this.store.selectedItem = null;

      if (id) {
        await this.store.fetchSelectedDrive(selectedCompany.key, id);
        const { currentPath, key, name, path, isDelete, isFavorite, fileTag, type, created_by, isMyFile } = this.store.selectedOpenItem
        path.push({ key, name, path: `/my_files/${id}`, isDelete, isFavorite, fileTag, type, created_by, isMyFile: false })
        partData = path;
      }
      else {
        const path: IPath = {
          key: 'my_files',
          name: 'បណ្ណសារដ្ឋាន',
          name_en: "My Files",
          path: '/my_files',
          isMyFile: true,
        }

        partData.push(path)
      }

      this.store.fetchPath(partData)
      this.APP_INFO = `No files or folders in Trash.`
      this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2FTRASHfolder.svg?alt=media&token=9a99b15c-4fcc-436f-a722-8de5f8d78389`
      this.APP_SUBTITLE = `Move files you don't need anymore to the Trash. Click "Empty trash" from the Trash menu to permanently delete items and free up storage space.`
      this.store.fetchTrashData(selectedCompany.key, res => {
        this.loading = false;
      })
    })
  }

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  ngOnDestroy() {
    const { fetchTrashDataRef } = this.store;
    fetchTrashDataRef.unsubscribe();
  }

  rightMenu({ x, y }: MouseEvent, item: any) {
    this.close();
    this.ds.currentMessage.subscribe(message => this.totalSize = message)
    this.store.selectedItem = item;
    this.store.isSelectedFile = true;
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
            this.snackBar.open("File has been restored successfully.", "Done", { duration: 3000 });
            return;
        }
      } else {
        this.snackBar.open("Fail to restored file.", "Done", { duration: 3000 });
      }
    })
  }

  onScroll() {

  }

  // toggleSidenav() {
  //   this.toggleActive = !this.toggleActive;
  //   this.sidenav.toggle();
  // }

  async onSelectedItem(item: any) {
    this.store.selectedItem = item;
    this.totalSize = 0;

    const f = await this.store.getFolderSize(item);

    f.forEach(s => {
      if (s.type.key === "file") {
        this.totalSize += s.size
      }
    });
    this.ds.changeMessage(this.totalSize)
    return this.totalSize
  }

}
