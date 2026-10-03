import { Component, OnInit, Input, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { TemplatePortal } from '@angular/cdk/portal';
import { fromEvent, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { FileTag } from 'src/app/stores/fileTag.store';
import { AuthStore } from 'src/app/stores/auth.store';

import { PERMISSION_TAG } from 'src/app/dummy/permission';

import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { UpdateFileTagComponent } from './update-file-tag/update-file-tag.component';


@Component({
  selector: 'app-file-tag',
  templateUrl: './file-tag.component.html',
  styleUrls: ['./file-tag.component.scss']
})
export class FileTagComponent implements OnInit {

  @Input() collection: string;
  @Input() backlink: string;
  @Input() title: string;

  PERMISSION_TAG:any=PERMISSION_TAG;
  ismobile: any;
  SELECTED_ITEM: any;
  sub: Subscription;
  overlayRef: OverlayRef | null;

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  constructor(
    private router: Router,
    public store: FileTag,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public auth: AuthStore,
    public breakpointObserver: BreakpointObserver,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.store.fetchData();
    this.breakpointObserver
    .observe(['(max-width: 736px)'])
    .subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.ismobile = state.matches;
      } else {
        this.ismobile = state.matches;
      }
    });
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }


  clearSelected() {
    this.store.selectedItem = null;
  }

  create() {
    this.router.navigate(['/file-manager/tags/add-tag'])
  }

  update(item:any){
    let dialogRef = this.dialog.open(UpdateFileTagComponent,{
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '400px',
      height: '',
      role: 'dialog',
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result == 'yes') {
    //     this.store.updatetag(item, (success) => {
    //       if (success) {
    //         this.snackBar.open("Tag color has been delete successful.", "Done", { duration: 3000 });
    //       } else {
    //         this.snackBar.open("Tag color fail to delete.", "Done", { duration: 3000 });
    //       }
    //     })
    //   }
    // });
  }

  delete(item:any){
    let dialogRef = this.dialog.open(DeleteComponent,{
      data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '',
      height: '',
      role: 'dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
        const collection = "file_tags"
        this.store.deleteDoc(collection, item, (success) => {
          if (success) {
            this.snackBar.open("Tag color has been delete successful.", "Done", { duration: 3000 });
                this.store.selectedItem = null;
          } else {
            this.snackBar.open("Tag color fail to delete.", "Done", { duration: 3000 });
          }
        })
      }
    });
  }

  rightMenu({ x, y }: MouseEvent, item: any) {
    this.close();
    this.store.selectedItem = item;
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
