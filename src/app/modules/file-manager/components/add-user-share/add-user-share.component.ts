import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MappingService } from 'src/app/shared/services/mapping.service';

import { AuthStore } from 'src/app/stores/auth.store';
import { FileManager } from 'src/app/stores/fileDrive.store';

@Component({
  selector: 'app-add-user-share',
  templateUrl: './add-user-share.component.html',
  styleUrls: ['./add-user-share.component.scss']
})
export class AddUserShareComponent implements OnInit {
  @ViewChild('focusInput', { static: false }) inputEl: ElementRef;
  form: FormGroup;
  user: AbstractControl;

  error: any;
  loading: boolean = true;
  registerStatusKey: string;
  filteredStudentStates: any;


  constructor(public dialogRef: MatDialogRef<AddUserShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: FileManager,
    public auth: AuthStore,

    ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      user: [null, Validators.compose([Validators.required, MappingService.validSelected.bind(this)])],
    })
    this.user = this.form.controls['user']

    let lessonData = await this.store.fetchallUserList();
    lessonData = MappingService.orderBy(lessonData, "full_name")
    this.filteredStudentStates = MappingService.autoComplete(this.user, lessonData, "full_name");
  }


  onClose() {
    this.dialogRef.close('no')
  }

  displayItem(item: any): string {
    return item ? item.full_name?item.full_name:item.email : item;
  }

  async create(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const {user} = f;
      // const groupSchedule = await this.store.fetchListingByCompany(this.auth.selectedCompany.key,"users","updated_at",null)
      // const { studentsKey, studentsRef } = groupSchedule;
      // if (studentsKey && studentsKey.filter(m => m === user.key).length > 0) {
      //   alert('សិស្សមាននៅក្នុងក្រុមរួចហើយ');
      //   this.inputEl.nativeElement.focus();
      //   this.form.enable();
      //   return;
      // }
      // const studentObj = pushObjArray(studentsRef || [], user);
      // this.store.addGroupMember(GROUP, studentObj, (success, error) => {
      //   this.form.reset();
      //   this.form.enable();
      //   this.inputEl.nativeElement.focus();
      // });
    }
  }

}
