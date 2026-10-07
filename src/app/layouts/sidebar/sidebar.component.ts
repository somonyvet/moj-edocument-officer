import { AuthStore } from '../../stores/auth.store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { UploadTaskComponent } from 'src/app/shared/components/upload-task/upload-task.component';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { SidebarStore } from 'src/app/stores/sidebar.store';
import { PERMISSION_MY_FILE, PERMISSION_USER, PERMISSION_GROUP_USER, PERMISSION_COMPANY, PERMISSION_TAG } from 'src/app/dummy/permission';
import { DataService } from '../../shared/services/data.service';
import { NewFolderComponent } from 'src/app/modules/file-manager/components/new-folder/new-folder.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class SidebarComponent implements OnInit {

  NEW_FOLDER_DIALOG = NewFolderComponent
  NEW_FILE_DIALOG = UploadTaskComponent

  folder: any
  routeID: any;

  expansions = {
    one: true,
    two: false,
    three: false,
    four: false,
    five: false,
    six: false,
    seven: false,
    eight: false,
    nine: false,
    ten: false,
  };

  toggleSidebar;
  disabled: boolean = true;
  profile: any;
  name: string;
  fs: any[]

  ismobile = false;
  PERMISSION_MY_FILE: any = PERMISSION_MY_FILE;
  PERMISSION_USER: any = PERMISSION_USER;
  PERMISSION_GROUP_USER: any = PERMISSION_GROUP_USER;
  PERMISSION_COMPANY: any = PERMISSION_COMPANY;
  PERMISSION_TAG: any = PERMISSION_TAG;

  provinceKey: any;

  constructor(
    public auth: AuthStore,
    public ds: DataService,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public store: FileManager,
    public sidebar: SidebarStore,
    public breakpointObserver: BreakpointObserver,

  ) {
  }

  onOpenItem(item: any) {
    // const { type } = item;
    // this.store.selectedItem = item;
    // if (type.key === driveObj.file.key) {
    //   const { fileType, downloadURL } = item;
    //   let openByIFrame: boolean = true;
    //   if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
    //     openByIFrame = false;
    //     window.open(downloadURL, "_blank");
    //     return;
    //   };
    //   this.dialog.open(OpenFileComponent, {
    //     data: { ITEM: item, openByIFrame },
    //     // data: item ? item : null,
    //     width: '80vw',
    //     height: '100vh',
    //     panelClass: 'open-file-panel',
    //     role: 'dialog',
    //   });
    //   return;
    // }
    const { selectedOpenItem } = this.store;
    if (selectedOpenItem) {
      this.router.navigate([`/my_files/${selectedOpenItem.key}`], { queryParams: { p: item.key } })
    }
    else {
      this.router.navigate([`/my_files`], { queryParams: { p: item.key } })
    }

  }


  openDialog(): void {
    // const dialogRef = this.dialog.open(NewFolderComponent, {
    //   width: '350px',
    //   data: {name: this.name}

    // });

    // dialogRef.afterClosed().subscribe(result => {
    // });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const { p } = params;
      this.provinceKey = p || null;
    })
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
        } else {
          this.ismobile = state.matches;
        }
      });
      const expansions = JSON.parse(localStorage.getItem("expansions"));
      if (expansions) {
        this.expansions = expansions
      }


    this.store.fetchProvinces();
  }

  onLogOut() {
    // const batch = this.ds.batch();
    // const uref = this.ds.userFireRef().doc(this.auth.user.uid);
    // this.ds.userFireRef().doc(this.auth.user.uid).collection('histories').get().then(doc => {
    //   if (doc.size) {
    //     doc.forEach(item => {
    //       batch.delete(item.ref);
    //       batch.update(uref, { selected_company: null })
    //     });
    //   } else {
    //     batch.update(uref, { selected_company: null })
    //   }
    //   batch.commit().then(() => {
    //     this.auth.signOut(() => {
    //       this.router.navigate(['/login'])
    //     });
    //   })
    // })
    this.auth.signOut(() => {
      this.router.navigate(['/login'])
    });
  }


  togglesidebar() {
    let body = document.getElementsByClassName("page-wrapper")[0];
    body.classList.toggle("toggled-sidebar");
    this.toggleSidebar = !this.toggleSidebar;
    localStorage.setItem("toggleSidebar", this.toggleSidebar)
  }

  onOpened(i:any) {
    const isOpen = true;
    switch (i) {
      case 1:
        this.expansions.one = isOpen;
        break;
      case 2:
        this.expansions.two = isOpen;
        break;
      case 3:
        this.expansions.three = isOpen;
        break;
      case 4:
        this.expansions.four = isOpen;
        break;
      case 5:
        this.expansions.five = isOpen;
        break;
      case 6:
        this.expansions.six = isOpen;
        break;
      case 7:
        this.expansions.seven = isOpen;
        break;
      case 8:
        this.expansions.eight = isOpen;
        break;
      case 9:
        this.expansions.nine = isOpen;
        break;
      case 10:
        this.expansions.ten = isOpen;
        break;
    }

    localStorage.setItem('expansions', JSON.stringify(this.expansions));

  }
  onClosed(i:any) {
    const isOpen = false;
    switch (i) {
      case 1:
        this.expansions.one = isOpen;
        break;
      case 2:
        this.expansions.two = isOpen;
        break;
      case 3:
        this.expansions.three = isOpen;
        break;
      case 4:
        this.expansions.four = isOpen;
        break;
      case 5:
        this.expansions.five = isOpen;
        break;
      case 6:
        this.expansions.six = isOpen;
        break;
      case 7:
        this.expansions.seven = isOpen;
        break;
      case 8:
        this.expansions.eight = isOpen;
        break;
      case 9:
        this.expansions.nine = isOpen;
        break;
      case 10:
        this.expansions.ten = isOpen;
        break;
    }

    localStorage.setItem('expansions', JSON.stringify(this.expansions));
  }

}
