import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MatMenuTrigger } from '@angular/material/menu';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthStore } from 'src/app/stores/auth.store';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';

@Component({
    selector: 'app-file-manager-layout',
    templateUrl: './file-manager-layout.component.html',
    styleUrls: ['./file-manager-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FileManagerLayoutComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) private contextMenu: MatMenuTrigger;
  NEW_FOLDER_DIALOG = NewFolderComponent
  isMobile: boolean = false;
  item: any;

  constructor(
    public auth: AuthStore,
    public store: FileManager,
    public afs: AngularFirestore,
    public breakpointObserver: BreakpointObserver
  ) { }

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
    this.store.fileManager = true;
  }

  ngOnDestroy(): void {
    this.store.fileManager = false
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }

}
