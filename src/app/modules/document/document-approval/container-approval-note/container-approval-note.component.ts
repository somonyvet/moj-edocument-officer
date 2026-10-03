import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';

@Component({
  selector: 'app-container-approval-note',
  templateUrl: './container-approval-note.component.html',
  styleUrls: ['./container-approval-note.component.scss']
})
export class ContainerApprovalNoteComponent implements OnInit {
  @Input() stamp_link: any;
  @Input() remarkFile: any;
  @Input() remarkOfficer: any;
  @Input() remark_officer: string;
  @Input() form : FormGroup;
  @Input() uid : string;
  @Input() remarkText : string;
  @Input() compareWithObj : any;
  @Output() selected_stamp = new EventEmitter<any>();
  @Output() remark_form = new EventEmitter<any>();
  @ViewChild('stampFile') stampFile: ElementRef;

  STAMP_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  fileSelected: any = null;
  remarkWrited: string = null;
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      remark_officer: [null]
    })
  }

  onSelectedStampFile(event) {
    this.fileSelected = event;
    // if (event && event.target.files.length > 0) {
    //   // this.selected_stamp = event.target.files[0];
      this.selected_stamp.emit(event)
    //   const reader = new FileReader();
    //   reader.readAsDataURL(event.target.files[0]);
    //   reader.onload = (event) => {
    //     this.STAMP_URL = event.target.result;
    //   }
    //   this.stampFile.nativeElement.value = "";
    // }
  }

  selectedRemark(event){
    this.remarkWrited = event;
    this.remark_form.emit(event)
  }
}
