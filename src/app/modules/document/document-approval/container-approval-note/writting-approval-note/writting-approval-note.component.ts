import { pushObjArray } from 'src/app/shared/services/convert.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { AddRemarkComponent } from './add-remark/add-remark.component';

@Component({
    selector: 'app-writting-approval-note',
    templateUrl: './writting-approval-note.component.html',
    styleUrls: ['./writting-approval-note.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WrittingApprovalNoteComponent implements OnInit {
  @ViewChild('stampFile') stampFile: ElementRef;
  @Input() form: UntypedFormGroup;
  @Input() stamp_link: any;
  @Input() compareWithObj: any;
  // @Input() remarkOfficer: any;
  @Input() uid: string;
  @Input() remarkText: string;
  @Output() remark_form = new EventEmitter<any>();
  @Output() selected_stamp = new EventEmitter<any>();
  @Output() outputRemark = new EventEmitter<any>();

  showContent: number = 0;
  STAMP_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  remark_officer: AbstractControl;
  remarkOfficer: Observable<Array<any>>;
  constructor(
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    private dialog: MatDialog
  ) { }

  async ngOnInit(){

    this.form = this.fb.group({
      remark_officer: [null],
      remark_text: [null]
    })
    this.remark_officer = this.form.controls['remark_officer']
    this.store.fetchRemarkTextOfficer(this.uid, res => {
      this.remarkOfficer = MappingService.autoComplete(this.remark_officer, res, 'remarkText');
    });

    if (this.remarkText){
      this.form.patchValue({
        remark_text: this.remarkText
      })
    }
  }

  displayName(item: any): string {
    return item ? item.remarkText : item;
  }

  onSelectedStampFile(event) {
    if (event && event.target.files.length > 0) {
      this.selected_stamp.emit(event.target.files[0])
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.STAMP_URL = event.target.result;
      }
      this.stampFile.nativeElement.value = "";
    }
  }

  selectedRemark(event) {
    if(event && event.option.value){
      const value = event.option.value.remarkText;
      this.form.patchValue({
        remark_text: value
      })
      this.outputRemark.emit(this.form.controls['remark_text'].value)
    }
  }

  getText(e){
    if(e){
      this.form.patchValue({
        remark_text: e
      })
    }
    this.outputRemark.emit(this.form.controls['remark_text'].value)
  }

  addRemarkText(item?: any){
    const dialogRef = this.dialog.open(AddRemarkComponent, {
      data: { item: item, uid: this.uid },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '92vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '30px', right: '26px', bottom: '30px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.text === 'yes') {
        this.form.patchValue({
          remark_text: result?.form?.remarkText || null,
          remark_officer: result?.form || null
        })
      }
    })

  }
}
