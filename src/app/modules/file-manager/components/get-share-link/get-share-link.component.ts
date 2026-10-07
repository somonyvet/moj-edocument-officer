import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-get-share-link',
    templateUrl: './get-share-link.component.html',
    styleUrls: ['./get-share-link.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GetShareLinkComponent implements OnInit {

  @ViewChild('sharedInput', { static: true }) sharedInput: ElementRef;
  @ViewChild('viewRefButton', { static: false }) public viewRefButton: ElementRef

  msg: any;
  form: UntypedFormGroup;
  user: AbstractControl;
  toppings = new UntypedFormControl();
  url: any;

  constructor(
    public dialogRef: MatDialogRef<GetShareLinkComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any
    , public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.msg = this.data;
    this.url = window.location.href;
  }

  // ngAfterViewInit(){
  //     if (this.sharedInput) {
  //       const inputElem = <HTMLInputElement>this.sharedInput.nativeElement;
  //       inputElem.select();
  //       document.execCommand('copy');
  //       inputElem.setSelectionRange(0, 0);
  //     }
  // }

  onClose() {
    this.dialogRef.close('no')
  }

}
