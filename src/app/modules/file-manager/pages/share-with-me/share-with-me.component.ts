import { Component, OnInit, ViewChild, TemplateRef, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { Subscription, fromEvent } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter, take } from 'rxjs/operators';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';

import { DataService } from 'src/app/shared/services/data.service';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';

import { driveObj } from 'src/app/dummy/status';
import { OpenFileComponent } from '../../components/open-file/open-file.component';

@Component({
    selector: 'app-share-with-me',
    templateUrl: './share-with-me.component.html',
    styleUrls: ['./share-with-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ShareWithMeComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;
  @ViewChild('contextMenu') contextMenu: MatMenuTrigger;
  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  TITLE: any = "Shared With Me"
  DRIVE_OBJ = driveObj
  toggleActive = false;
  isMobile = false;
  setting: any;
  snackBar: any;

  APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fstar.svg?alt=media&token=382814fb-f1ab-4693-b9d6-da41bff01a08`
  APP_INFO = `No Public shared files.`
  APP_SUBTITLE = 'Add public share file and allow all user in company to see it.'

  PATH_KEY: any;
  sub: Subscription;
  overlayRef: OverlayRef | null;
  totalSize: any;
  parentFolder = "shared-with-me";
  FOLDER_PATH: any = {
    key: 'shared_with_me',
    name: 'Shared With Me',
    path: '/shared-with-me',
    isMyFile: false,
    order: 0,
  }

  constructor(
    public store: FileManager
    , public auth: AuthStore
    , private router: Router
    , private dialog: MatDialog
    , public overlay: Overlay
    , private sidenavService: SideNavService
    , public breakpointObserver: BreakpointObserver
    , public viewContainerRef: ViewContainerRef
    , private ds: DataService
    , private route: ActivatedRoute) { }

  async ngOnInit() {

    this.sidenavService.setSidenav(this.sidenav);


    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = state.matches;
        } else {
          this.isMobile = state.matches;
        }
      });
    this.route.params.subscribe(async param => {
      this.PATH_KEY = param.id || null;

      let partData: any[] = [];
      let path: any = null;
      this.store.selectedItem = null;
      this.store.selectedOpenItem = null;
      const { selectedCompany, user } = this.auth;
      let ownerKey: any = user.uid;
      if (this.PATH_KEY) {
        await this.store.fetchSelectedDrive(selectedCompany.key, this.PATH_KEY);
        const { key, name, path, isDelete, isFavorite, fileTag, type, created_by } = this.store.selectedOpenItem;
        let currentPath:any[] = path.map((m, i) => {
          if (i === 0) return this.FOLDER_PATH
          else return { ...m,path:`/${this.parentFolder}/${m.key}`, order: i }
        })
        currentPath.push({
          key, name,
          path: `/${this.parentFolder}/${this.PATH_KEY}`,
          isDelete, isFavorite, fileTag, type, created_by,
          isMyFile: false,
          order: path.length,
        })
        partData = currentPath;
        ownerKey = created_by.key;
      }
      else {
        path = this.FOLDER_PATH
        partData.push(path)
      }
      const { selectedOpenItem } = this.store;
      this.store.fetchPath(partData)
      this.store.fetchSharedWithMe(selectedCompany.key, ownerKey, selectedOpenItem, partData[partData.length - 1])
    })
  }


  onScroll() {

  }

  async onOpenItem(item: any) {
    const { fileKey } = item;
    const { selectedCompany } = this.auth;
    if (fileKey) {
      const selectedItem = await this.store.fetchSelectedDrive(selectedCompany.key, fileKey);
      this.store.selectedItem = selectedItem;
    }
    else {
      this.store.selectedItem = item;
    }

    const { type, key } = this.store.selectedItem;
    if (type && type.key === driveObj.file.key) {
      const { fileType, downloadURL } = item;
      let openByIFrame: boolean = true;
      if (fileType !== 'application/pdf' && fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL, "_blank");
        return;
      };
      this.dialog.open(OpenFileComponent, {
        data: { ITEM: item, openByIFrame },
        width: '80vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    this.router.navigate([`/${this.parentFolder}/${key}`])
  }

  onSelectedItem(item: any) {
    const { fileKey } = item;
    if (fileKey) {
      // this.store.selectedItem = item;
      this.ds.folderRef().doc(fileKey).valueChanges().subscribe((doc: any) => {
        this.store.selectedItem = doc || null;
      })
    }
    else {
      this.store.selectedItem = item;

    }
  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
  }

  ngOnDestroy() {
    if (this.store.myFileSubscript) this.store.myFileSubscript.unsubscribe()
  }

  closeEvent(ev) {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }


  rightMenu({ x, y }: MouseEvent, item: any) {
    this.close();
    // this.ds.currentMessage.subscribe(message => this.totalSize = message)
    const { fileKey } = item;
    if (fileKey) {
      // this.store.selectedItem = item;
      this.ds.folderRef().doc(fileKey).valueChanges().subscribe((doc: any) => {
        this.store.selectedItem = doc || null;
      })
    }
    else {
      this.store.selectedItem = item;

    }

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



}
