import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, ViewContainerRef, Output, EventEmitter, Renderer2, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter, take } from 'rxjs/operators';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';

import { FileTag } from 'src/app/stores/fileTag.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { FileManager } from 'src/app/stores/fileDrive.store';

import { driveObj } from 'src/app/dummy/status';
import { PERMISSION_MY_FILE } from 'src/app/dummy/permission';

import { UploadTaskComponent } from 'src/app/shared/components/upload-task/upload-task.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { RenameFileComponent } from 'src/app/modules/file-manager/components/rename-file/rename-file.component';
import { DeleteForeverComponent } from '../delete-forever/delete-forever.component';
import { GetShareLinkComponent } from '../get-share-link/get-share-link.component';
import { OpenFileComponent } from '../open-file/open-file.component';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';
import { ShareMyFileComponent } from 'src/app/modules/file-manager/components/share-my-file/share-my-file.component';

@Component({
  selector: 'app-right-click-menu',
  templateUrl: './right-click-menu.component.html',
  styleUrls: ['./right-click-menu.component.scss']
})
export class RightClickMenuComponent implements OnInit {

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  ismobile = false;
  toggleActive = false;
  item: any;
  tagColor: any;

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  sub: Subscription;
  enteredButton = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  prevButtonTrigger;
  totalSize: number = 0;

  @ViewChild('userMenu') userMenu: TemplateRef<any>;
  @Output() onClose = new EventEmitter();

  overlayRef: OverlayRef | null;
  PERMISSION_MY_FILE: any = PERMISSION_MY_FILE;
  FILE: any;

  constructor(
    public auth: AuthStore,
    public store: FileManager,
    public tag: FileTag,
    private dialog: MatDialog,
    public afs: AngularFirestore,
    public router: Router,
    private snackBar: MatSnackBar,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    private ren: Renderer2,
    public breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
      });
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    this.FILE =  isSelectedFile ? selectedItem : selectedOpenItem;
    this.tag.fetchTagColor(data => {
      this.tagColor = data
    })
  }

  fetchSelectedFile(file, dialog, user, company) {
    this.onClose.emit(file);
    this.store.fetchSelectedFile(file, dialog, user, company)
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }

  getDownload() {
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    const item = isSelectedFile ? selectedItem : selectedOpenItem;
    window.open(item.downloadURL, "_blank");
  }

  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.onSelectedItem(item);

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  open({ x, y }: MouseEvent, user) {
    this.close();
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }
      ]);
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });
    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, {
      $implicit: user
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

  rename() {
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    const item = isSelectedFile ? selectedItem : selectedOpenItem;
    this.onClose.emit(item);
    let dialogRef = this.dialog.open(RenameFileComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '480px',
      height: '',
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  deleteForever(item: any) {
    this.onClose.emit(item);
    if (item.isDelete === true) {
      let dialogRef = this.dialog.open(DeleteForeverComponent, {
        data: item ? item : null,
        panelClass: 'cs-overlay-panel',
        width: '600px',
        height: '',
        role: 'dialog',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'yes') {
          this.store.DeleteForeverFile(item, (success) => {
            if (success) {
              this.store.selectedItem = null;
              this.snackBar.open("File has permanently deleted.", "Done", { duration: 3000 });
            } else {
              this.snackBar.open("Fail to delete file.", "Done", { duration: 3000 });
            }
          })
        }
      });
    }
  }

  emptyTrash(item) {
    let dialogRef = this.dialog.open(DeleteForeverComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '',
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
        this.store.EmptyTrash((success) => {
          if (success) {
            this.store.selectedItem = null;
            this.snackBar.open("Empty trash bin successfully .", "Done", { duration: 3000 });
          } else {
            this.snackBar.open("Fail to empty trash bin.", "Done", { duration: 3000 });
          }
        })
      }
    });
  }

  sharedPerson() {
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    const item = isSelectedFile ? selectedItem : selectedOpenItem;
    let dialogRef = this.dialog.open(ShareMyFileComponent, {
      data: item,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '95vh',
      role: 'dialog',
      disableClose: true
    });
    this.onClose.emit(item);
    dialogRef.updatePosition({ top: 20 + 'px', right: 20 + 'px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

  getShareLink(item) {
    this.onClose.emit(item);
    let dialogRef = this.dialog.open(GetShareLinkComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '480px',
      height: '',
      role: 'dialog',
    });
  }

  restore(item: any) {
    this.onClose.emit(item);
    this.store.RestoreFile(item, this.auth.user, async (success) => {
      if (success) {
        const foundResult = await this.store.getAllRelatedFileOrFolder(item.key);

        await Promise.all(foundResult.map(async (item) => {
          await this.store.RestoreFile0(item, this.auth.User);
        }));

        switch (item.type.key) {
          case 'file':
            this.store.selectedItem = null;
            this.snackBar.open("File has been restored successfully.", "Done", { duration: 3000 });
            return;
          case 'folder':
            this.store.selectedItem = null;
            this.snackBar.open("Folder has been restored successfully.", "Done", { duration: 3000 });
            return;
          default:
            this.store.selectedItem = null;
            this.snackBar.open("File has been restored suxwccessfully.", "Done", { duration: 3000 });
            return;
        }
      } else {
        this.snackBar.open("Fail to restored file.", "Done", { duration: 3000 });
      }
    })
  }

  delete() {
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    const item = isSelectedFile ? selectedItem : selectedOpenItem;

    this.onClose.emit(item);
    const { pathString } = item;

    this.store.RemoveFile(item, this.auth.User, async (success) => {
      if (success) {
        const foundResult = await this.store.getAllRelatedFileOrFolder(item.key);

        await Promise.all(foundResult.map(async (item) => {
          await this.store.RemoveFile0(item, this.auth.User);
        }));

        switch (item.type.key) {
          case 'file':
            this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
            this.store.selectedItem = null;
            break;
          case 'folder':
            this.snackBar.open("Folder has been removed successfully.", "Done", { duration: 3000 });
            this.store.selectedItem = null;
            break;
          default:
            this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
            this.store.selectedItem = null;
            break;
        }

        // if (pathString.length > 1) {
        //   this.router.navigate([`/file-manager/my_files/${pathString[pathString.length - 1]}`])
        // }
        // else {
        //   this.router.navigate([`/file-manager/my_files`])
        // }
      } else {
        this.snackBar.open("Fail to delete file.", "Done", { duration: 3000 });
      }
    })

  }

  changeColor(tag) {
    const { selectedItem, selectedOpenItem, isSelectedFile } = this.store;
    const item = isSelectedFile ? selectedItem : selectedOpenItem;

    if (item.type.key === 'folder') {
      const { key, created_by } = item;

      const row = {
        key: key,
        created_by: created_by,
        fileTag: tag,
        fileTagUser: this.auth.User
      };

      this.store.ChangeTagColor(row, (success) => {
        if (isSelectedFile) {
          this.store.selectedItem.fileTag.color = item.fileTag.color;
        }
        else {
          this.store.selectedOpenItem.fileTag.color = item.fileTag.color;
        }
      })
    }
  }

  isFavorite(item: any) {
    this.onClose.emit(item);
    if (item.isFavorite == true) {
      this.store.unFavorite(item, this.auth.user, (success) => {
        if (success) {
          switch (item.type.key) {
            case 'file':
              this.snackBar.open("One file removed from Favorite.", "Done", { duration: 3000 });
              break;
            case 'folder':
              this.snackBar.open("One folder removed from Favorite .", "Done", { duration: 3000 });
              break;
            default:
              this.snackBar.open("One file removed from Favorite. .", "Done", { duration: 3000 });
              break;
          }
        } else {
          this.snackBar.open("Fail to removed file from favorited.", "Done", { duration: 3000 });
        }
      })
    } else {
      this.store.isFavorite(item, this.auth.user, (success) => {
        if (success) {
          switch (item.type.key) {
            case 'file':
              this.snackBar.open("One file added to Favorite.", "Done", { duration: 3000 });
              return;
            case 'folder':
              this.snackBar.open("One folder added to Favorite .", "Done", { duration: 3000 });
              return;
            default:
              this.snackBar.open("One file added to Favorite. .", "Done", { duration: 3000 });
              return;
          }
        } else {
          this.snackBar.open("Fail to added file to favorited.", "Done", { duration: 3000 });
        }
      })
    }

  }
  onOpenItem(item: any) {
    this.onClose.emit(item);
    const { type } = item;
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

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  closeMenu() {
    this.close();
  }

  mouseleave(e) {
    this.close();
  }

  menuenter() {
    this.isMatMenuOpen = true;
    if (this.isMatMenu2Open) {
      this.isMatMenu2Open = false;
    }
  }

  buttonEnter(trigger) {
    setTimeout(() => {
      if (this.prevButtonTrigger && this.prevButtonTrigger != trigger) {
        this.prevButtonTrigger.closeMenu();
        this.prevButtonTrigger = trigger;
        this.isMatMenuOpen = false;
        this.isMatMenu2Open = false;
        // trigger.openMenu();
        // this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-focused');
        // this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-program-focused');
      }
      else if (!this.isMatMenuOpen) {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger
        trigger.openMenu();
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-program-focused');

      }
      else {
        this.enteredButton = true;
        this.prevButtonTrigger = trigger
      }
    })
  }

  buttonLeave(trigger) {
    setTimeout(() => {
      if (this.enteredButton) {
        trigger.closeMenu();
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-program-focused');
      } if (this.isMatMenuOpen) {
        trigger.closeMenu();
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.enteredButton = false;
      }
    }, 100)
  }

}

