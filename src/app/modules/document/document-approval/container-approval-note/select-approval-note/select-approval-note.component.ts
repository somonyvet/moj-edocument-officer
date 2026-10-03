import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';

@Component({
  selector: 'app-select-approval-note',
  templateUrl: './select-approval-note.component.html',
  styleUrls: ['./select-approval-note.component.scss']
})
export class SelectApprovalNoteComponent implements OnInit {
  @ViewChild('stampFile') stampFile: ElementRef;
  @Input() form: FormGroup;
  @Input() remarkFile: any;
  @Input() stamp_link: any;
  @Input() compareWithObj: any;
  @Input() remarkOfficer: any;
  @Output() remark_form = new EventEmitter<any>();
  @Output() selected_stamp = new EventEmitter<any>();

  STAMP_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      remark_officer: [null]
    })

    // this.STAMP_URL = this?.remarkFile?.downloadUrl || null
    // this.selected_stamp.emit(this?.remarkFile)
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
    this.remark_form.emit(event);
  }
}
