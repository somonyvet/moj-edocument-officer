import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService, fieldValue } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { Observable } from 'rxjs';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { toDateKey, toDepartmentNoWorkplace, toEmployee } from 'src/app/shared/services/mapping.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-criminal-record-approval-top-m',
  templateUrl: './criminal-record-approval-top-m.component.html',
  styleUrls: ['./criminal-record-approval-top-m.component.scss']
})
export class CriminalRecordApprovalTopMComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docAttachFile') docAttachFile: ElementRef;
  @ViewChild('signatureFile') signatureFile: ElementRef;
  @ViewChild('stampFile') stampFile: ElementRef;

  titleForm: any = "បានពិនិត្យ និងឯកភាព";
  form: FormGroup;

  process: boolean = false;

  SELECTED_FILES: any[] = [];
  SELECTED_DOC_FILES: any[] = [];
  START_UPLOAD_FILES: boolean = false;
  URLFile: any = '';
  uploadPercentFile: any;

  SELECTED_PHOTO: any = null;
  SELECTED_STAMP: any = null;
  SELECTED_SIGNATURE: any = null;
  SIGNATURE_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  STAMP_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  remarkOfficer: Observable<Array<any>>;
  remark_officer: AbstractControl;
  uid;

  constructor(
    public dialogRef: MatDialogRef<CriminalRecordApprovalTopMComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
    public store: CriminalApplicationStore,
    private router : Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      remark: [null],
      remarkText: [null],
      remark_officer: [null]
    })
    this.remark_officer = this.form.controls['remark_officer']
    const { item } = this.data
    const { employee } = this.auth

    // if (item) {
    //   this.form.patchValue({
    //     remark: item?.remark || null,
    //     remarkText: item?.remarkText || null,
    //     remark_officer: item?.remark_officer || null
    //   })

      this.SIGNATURE_URL = employee?.signatureFile?.downloadUrl || null
    // }
    const { uid } = this.auth;
    this.uid = uid;
  }

  onSelectedSignatureFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_SIGNATURE = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.SIGNATURE_URL = event.target.result;
      }
      this.signatureFile.nativeElement.value = "";
    }
  }

  selectedRemark(event) {
    this.form.patchValue({
      remarkText: event,
    })
  }

  onSelectedStampFile(event) {
    // if (event && event.length > 0) {
    this.SELECTED_STAMP = event;
    //   const reader = new FileReader();
    //   reader.readAsDataURL(event.target.files[0]);
    //   reader.onload = (event) => {
    //     this.STAMP_URL = event.target.result;
    //   }
    //   this.stampFile.nativeElement.value = "";
    // }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { remark_officer, remarkText } = f;
      const { uid, currentDepartment, employee, config } = this.auth;
      const { selectedGroupDoc } = this.store

      let data: any = {
        classification_approvedAt: new Date(),
        classification_approvedBy: uid,
        // doc_status: headerDocument?.doc_status || null,
        default_classification_stampFile: employee?.stampFile || null,
        default_classification_remarkFile: employee?.signatureFile || null,
        default_classification_signatureFile: employee?.signatureFile || null,
        is_classification_approved: true,

        // remarkText: remarkText || null,
        // remark_officer: remark_officer ? {
        //   key: remark_officer?.key,
        //   // name:remark_officer?.name
        //   name: remark_officer?.remarkText
        // } : null,

        // default_stampFile: account?.stampFile || null,
        // default_remarkFile: account?.remarkFile || null,
        // default_signatureFile: account?.signatureFile || null,
      }

      if (this.SELECTED_SIGNATURE) {
        const file = await this.storage.upload([this.SELECTED_SIGNATURE])
        data.classification_signatureFile = file[0]
      } else {

        data.classification_signatureFile = employee?.signatureFile
      }
      const { items } = this.data
      let criminalData = [];
      items.forEach(e=>{
        const criminal = {
          ...e,
          approved_at: this.auth.serverDateTime,
          approved_by: this.auth.getMappedApprover(),
          updated_at: this.auth.serverDateTime,
          updated_by: this.auth.getMappedProfile(),
          tran_at: this.auth.serverDateTime,
          tran_date_key: toDateKey(new Date),
          status: STATUS_OBJ.PROCESSING,
          internal_status: STATUS_OBJ.PROCESSING,
          default_stampFile: employee?.stampFile || null,
          default_remarkFile: employee?.signatureFile || null,
          default_signatureFile: data.classification_signatureFile ||  null,
          request_approval_workplace: fieldValue().arrayRemove(currentDepartment?.key)
        }

        const movement = {
          key: this.ds.createId(),
          created_at: this.auth.serverDateTime,
          created_by: this.auth.getMappedProfile(),
          profile: toEmployee(employee, true),
          workplaceKey: currentDepartment?.key,
          workplace: toDepartmentNoWorkplace(currentDepartment),
          tran_at: criminal?.tran_at,
          tran_date_key: criminal?.tran_date_key,
          criminalRecordKeyRef: criminal?.key,
          citizenKeyRef: criminal?.citizen_ref,
          criminalStatus: criminal?.status,
          internal_status: criminal?.internal_status || null,
          criminalCategory: criminal?.criminal_record_category,

          default_stampFile: criminal?.default_stampFile || null,
          default_remarkFile: criminal?.default_remarkFile || null,
          default_signatureFile: criminal?.default_signatureFile || null,

          criminalSkipWorkplace: config?.criminal_record_category?.key === criminal?.criminal_record_category?.key,
        }

        criminalData.push({criminal,movement})
      })

      this.store.approveFolderBatch(criminalData,(success)=>{
        this.form.enable();
        if (success) {
          this.snackBar.open(`បានពិនិត្យ និងឯកភាពដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close();
          this.router.navigate(['/criminal-record/approval/20Day/list'])
        }
      })

      // this.store.approveCriminalRecordTopM(criminal, movement, (success, res) => {
      //   this.form.enable();
      //   if (success) {
      //     this.snackBar.open(`បានពិនិត្យ និងឯកភាពដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      //     this.form.reset();
      //     this.dialogRef.close();
      //   } else {
      //     alert(res);
      //   }
      // })

    }
  }
}
