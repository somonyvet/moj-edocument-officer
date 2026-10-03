import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { Router } from '@angular/router';
import { UploadTaskComponent } from 'src/app/shared/components/upload-task/upload-task.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent
  DELETE_FILE_DIALOG = DeleteComponent

  isMobile:boolean = false;
  item:any;

  @ViewChild(MatMenuTrigger,) contextMenu: MatMenuTrigger;

  constructor(
    public auth: AuthStore,
    public store: FileManager,
    private dialog: MatDialog,
    public afs:AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar,
    public breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = state.matches;
        } else {
          this.isMobile = state.matches;
        }
      });
  }


  // onRightClick(e) {
  //   e.preventDefault();
  // }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }


  // contextMenuPosition = { x: '0px', y: '0px' };
  // onContextMenu(event: MouseEvent, item: any) {
  //   this.store.selectedItem = this.item;
  //   this.contextMenuPosition.x = event.clientX + 'px';
  //   this.contextMenuPosition.y = event.clientY + 'px';
  //   this.contextMenu.menuData = { 'item': item };
  //   this.contextMenu.menu.focusFirstItem('mouse');
  //   this.contextMenu.openMenu();
  // }

}
