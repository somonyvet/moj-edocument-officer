import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { driveObj } from 'src/app/dummy/status';
import { PERMISSION_MY_FILE } from 'src/app/dummy/permission';
import { FileTag } from 'src/app/stores/fileTag.store';
import { SettingStore } from 'src/app/stores/settings/setting.store';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { SideNavService } from 'src/app/shared/services/sidenav.servce';
import { getShowInfo, setShowInfo } from 'src/app/shared/services/storage.service';
import { DeleteForeverComponent } from '../delete-forever/delete-forever.component';
import { RenameFileComponent } from '../rename-file/rename-file.component';
import { GetShareLinkComponent } from '../get-share-link/get-share-link.component';
import { DeleteShareFileComponent } from '../delete-share-file/delete-share-file.component';
import { OpenFileComponent } from '../open-file/open-file.component';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';
import { ShareMyFileComponent } from 'src/app/modules/file-manager/components/share-my-file/share-my-file.component';
import { UploadTaskComponent } from '../../../../shared/components/upload-task/upload-task.component';
import { DeleteComponent } from '../../../../shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-command-bar',
    templateUrl: './command-bar.component.html',
    styleUrls: ['./command-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class CommandBarComponent implements OnInit {

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  toggleActive: boolean;
  ismobile: boolean = false;
  tagColor: any;
  currentFolder: any;

  PERMISSION_MY_FILE: any = PERMISSION_MY_FILE;
  parentPath: any = 'my_files'
  totalPath: number = 0;

  form: UntypedFormGroup;
  search: AbstractControl;

  constructor(
    public store: FileManager,
    public auth: AuthStore,
    private sidenav: SideNavService,
    public tag: FileTag,
    public router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public setting: SettingStore,
    public breakpointObserver: BreakpointObserver,
    private fb: UntypedFormBuilder,
  ) { }

  async ngOnInit() {
    const toggle: boolean = (await getShowInfo()) || false;
    this.parentPath = this.router.url.split('/')[1];
    this.totalPath = this.router.url.split('/').length;
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe(async (state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
        this.toggleActive = toggle;
        if (toggle === true && this.ismobile === false && this.sidenav) this.sidenav.toggle();
      });

    this.tag.fetchTagColor(data => { this.tagColor = data })
    this.form = this.fb.group({
      search: [null, [Validators.required]]
    });

  }

  ngOnDestroy() {
    const { fetchTagColorRef } = this.tag;
    const { fetchSearchRef } = this.store;
    fetchTagColorRef && fetchTagColorRef.unsubscribe();
    fetchSearchRef && fetchSearchRef.unsubscribe();
  }

  getDownload(item) {
    window.open(item.downloadURL, "_blank");
  }

  sharedPerson(item) {
    let dialogRef = this.dialog.open(ShareMyFileComponent, {
      data: item,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '95vh',
      role: 'dialog',
      disableClose: true
    });
    dialogRef.updatePosition({ top: 20 + 'px', right: 20 + 'px' });
    dialogRef.afterClosed().subscribe(result => {
      this.store.selectedItem = item;
    });
  }

  stopSharedPerson(item) {
    let dialogRef = this.dialog.open(ShareMyFileComponent, {
      data: item,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '95vh',
      role: 'dialog',
      disableClose: true
    });
    dialogRef.updatePosition({ top: 20 + 'px', right: 20 + 'px' });
    dialogRef.afterClosed().subscribe(result => {
      this.store.selectedItem = item;

    });
  }

  changeColor(f, tag, menu) {
    if (f.type.key === 'folder') {
      const { key, created_by } = f;
      const item = {
        key: key,
        created_by: created_by,
        fileTag: tag,
        fileTagUser: this.auth.profile
      }
      this.store.ChangeTagColor(item, (success) => {
        if (menu == 'm') {
          this.store.selectedItem.fileTag.color = item.fileTag.color;
        }
      })
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
            this.snackBar.open("Empty trash bin successfully .", "Done", { duration: 3000 });
          } else {
            this.snackBar.open("Fail to empty trash bin.", "Done", { duration: 3000 });
          }
        })
      }
    });
  }

  ShareWithUser(item) {
    let dialogRef = this.dialog.open(ShareMyFileComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '480px',
      height: '',
      role: 'dialog',
    });

  }

  getShareLink(item) {
    let dialogRef = this.dialog.open(GetShareLinkComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '480px',
      height: '',
      role: 'dialog',
    });
  }

  rename(item: any) {
    let dialogRef = this.dialog.open(RenameFileComponent, {
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '480px',
      height: '',
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  isFavorite(item: any) {
    if (item.isFavorite == true) {
      this.store.unFavorite(item, this.auth.profile, (success) => {
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
          this.snackBar.open("Fail to removed file from favorites.", "Done", { duration: 3000 });
        }
      })
    } else {
      this.store.isFavorite(item, this.auth.profile, (success) => {
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
          this.snackBar.open("Fail to added file to favorites.", "Done", { duration: 3000 });
        }
      })
    }
  }

  deleteForever(item: any) {
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
              this.snackBar.open("File has permanently deleted.", "Done", { duration: 3000 });
            } else {
              this.snackBar.open("Fail to delete file.", "Done", { duration: 3000 });
            }
          })
        }
      });
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

  delete(item: any) {
    if (item.shared === true) {
      let dialogRef = this.dialog.open(DeleteShareFileComponent, {
        data: item ? item : null,
        panelClass: 'cs-overlay-panel',
        width: '600px',
        height: '',
        role: 'dialog',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'yes') {
          this.store.RemoveFile(item, this.auth.profile, (success) => {
            if (success) {
              switch (item.type.key) {
                case 'file':
                  this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
                  this.store.selectedItem = null;
                  break;
                case 'folder':
                  this.snackBar.open("Folder has been removed successfully.", "Done", { duration: 3000 });
                  break;
                default:
                  this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
                  break;
              }
            } else {
              this.snackBar.open("Fail to delete file.", "Done", { duration: 3000 });
            }
          })
        }
      });
    } else {
      this.store.RemoveFile(item, this.auth.profile, (success) => {
        if (success) {
          switch (item.type.key) {
            case 'file':
              this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
              this.store.selectedItem = null;
              break;
            case 'folder':
              this.snackBar.open("Folder has been removed successfully.", "Done", { duration: 3000 });
              break;
            default:
              this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
              break;
          }
        } else {
          this.snackBar.open("Fail to delete file.", "Done", { duration: 3000 });
        }
      })
    }
  }

  removePinned(item: any) {
    this.store.RemovePinned(item, this.auth.profile, (success) => {
      if (success) {
        this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
        this.store.selectedItem = null;
      } else {
        this.snackBar.open("Fail to remove file.", "Done", { duration: 3000 });
      }
    })
  }

  removeShared(item: any) {
    this.store.RemoveShared(item, this.auth.profile, (success) => {
      if (success) {
        this.snackBar.open("File has been removed from public shared successfully.", "Done", { duration: 3000 });
        this.store.selectedItem = null;
      } else {
        this.snackBar.open("Fail to remove file.", "Done", { duration: 3000 });
      }
    })
  }

  removeShareWithMe(item: any) {
    this.store.RemoveSharedWithMe(item, this.auth.profile, (success) => {
      if (success) {
        this.snackBar.open("File has been removed from public shared successfully.", "Done", { duration: 3000 });
        this.store.selectedItem = null;
      } else {
        this.snackBar.open("Fail to remove file.", "Done", { duration: 3000 });
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
        width: '100%',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    this.router.navigate([`/my_files/${item.key}`, {}])
  }

  toggleSidenav() {
    this.toggleActive = !this.toggleActive;
    setShowInfo(this.toggleActive);
    this.sidenav.toggle();
  }

  goBack(item: any) {
    const { key, path } = item;
    this.router.navigate([ '/file-manager/' + path])
  }

  toggleSidebar;

  togglesidebar() {
    let body = document.getElementsByClassName("page-wrapper")[0];
    body.classList.toggle("toggled-sidebar");
    this.toggleSidebar = !this.toggleSidebar;
    localStorage.setItem("toggleSidebar", this.toggleSidebar)
  }

}
