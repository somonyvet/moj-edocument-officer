import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AddUserShareComponent } from '../add-user-share/add-user-share.component';

@Component({
    selector: 'app-share-with-user',
    templateUrl: './share-with-user.component.html',
    styleUrls: ['./share-with-user.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ShareWithUserComponent implements OnInit {

  msg: any;
  form: UntypedFormGroup;
  user: AbstractControl;
  toppings = new UntypedFormControl();
  url:any;

  @ViewChild('viewRefButton', { static: false }) public viewRefButton: ElementRef

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  constructor(
    public dialogRef: MatDialogRef<ShareWithUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ,public dialog: MatDialog,

  ) { }

  ngOnInit() {
    this.msg = this.data;
    this.url = window.location.href;

  }

  onClose() {
    this.dialogRef.close('no')
  }

  addShareUser(group: any) {
    const rect = this.viewRefButton.nativeElement.getBoundingClientRect()
    const dialogRef = this.dialog.open(AddUserShareComponent, {
      data: this.msg,
      panelClass: 'register-test-overlay-panel',
      width: rect.width + 'px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: rect.top + 'px', left: rect.left + 'px' });
    dialogRef.afterClosed().subscribe(result => { });
  }

}
