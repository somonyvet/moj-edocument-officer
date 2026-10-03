import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { fromEvent, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, ActivatedRoute } from '@angular/router';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';

import { IPath } from 'src/app/interfaces/file-manager';
import { driveObj } from 'src/app/dummy/status';

import { SideNavService } from 'src/app/shared/services/sidenav.servce';
import { OpenFileComponent } from '../../components/open-file/open-file.component';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {

  @ViewChild('userMenu') userMenu: TemplateRef<any>;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  TITLE: any = "ឯកសារសំខាន់"
  APP_INFO = `ពុំមានឯកសារ`
  DRIVE_OBJ = driveObj
  ismobile = false;

  setting: any;
  snackBar: any;

  loading: boolean = true;
  parentFolder = "my_files";
  APP_IMG: any;
  APP_SUBTITLE: any;
  sub: Subscription;
  overlayRef: OverlayRef | null;

  constructor(public store: FileManager
    , public auth: AuthStore
    , private router: Router
    , private dialog: MatDialog
    , private sidenavService: SideNavService
    , public breakpointObserver: BreakpointObserver
    , private overlay: Overlay
    , public viewContainerRef: ViewContainerRef,
    private changeRef: ChangeDetectorRef

    , private route: ActivatedRoute) { }

  async ngOnInit() {

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
          key: 'favorites',
          name: 'Favorites',
          path: '/favorites'
        }
        partData.push(path)
      }
      this.APP_INFO = `File Manager lets you access your stuff on every computer and mobile device.`
      this.APP_IMG = `https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Ffolder.svg?alt=media&token=75877285-6cf8-40d6-a96b-711684c78f75`
      this.APP_SUBTITLE = `Drag file here or add files by using the "New" button.`
      this.store.fetchPath(partData)
      this.store.fetchFavoriteData(selectedCompany.key, user, res => {
        this.loading = false;
      })
    })
  }

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  ngOnDestroy() {
    const { fetchFavoriteDataRef } = this.store;
    fetchFavoriteDataRef && fetchFavoriteDataRef.unsubscribe();
  }

  unFavorite(item: any) {
    this.store.unFavorite(item, this.auth.user, (success) => {
      if (success) {
        switch (item.type.key) {
          case 'file':
            this.snackBar.open("One file removed from Favorite.", "Done", { duration: 3000 });
            return;
          case 'folder':
            this.snackBar.open("One folder removed from Favorite .", "Done", { duration: 3000 });
            return;
          default:
            this.snackBar.open("One file removed from Favorite. .", "Done", { duration: 3000 });
            return;
        }
      } else {
        this.snackBar.open("Fail to removed file from favorited.", "Done", { duration: 3000 });
      }
    })
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
        width: '100vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    this.router.navigate([`/my_files/${item.key}`, {}])
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
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

  closeEvent(ev) {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

}
