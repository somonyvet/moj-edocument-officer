import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, AbstractControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService, fieldValue } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DECREE_STATUS_OBJ, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { Observable } from 'rxjs';
import { toDateKey, toDepartmentNoWorkplace, toEmployee } from 'src/app/shared/services/mapping.service';
import { Router } from '@angular/router';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ICriminalRecord } from 'src/app/interfaces/criminal.interface';
@Component({
    selector: 'app-digital-approval-form',
    templateUrl: './digital-approval-form.component.html',
    styleUrls: ['./digital-approval-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DigitalApprovalFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('docAttachFile') docAttachFile: ElementRef;
  @ViewChild('signatureFile') signatureFile: ElementRef;
  @ViewChild('stampFile') stampFile: ElementRef;
  titleForm: any = "អនុម័តព្រឹត្តិបត្រ";
  rejectTargets: any[] = [];
  form: UntypedFormGroup;

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
    public dialogRef: MatDialogRef<DigitalApprovalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
    public store: CriminalApplicationStore,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      remark: [null],
      remarkText: [null],
      remark_officer: [null],
      comment_officer: [null]
    })
    this.remark_officer = this.form.controls['remark_officer']

    if (this.isReject) {
      this.titleForm = "បដិសេធព្រឹត្តិបត្រ";
      this.rejectTargets = this.buildRejectTargets();
      this.form.addControl('reject_to_workplace_key', this.fb.control(this.rejectTargets?.[this.rejectTargets?.length - 1]?.key || null, [Validators.required]));
      this.form.get('comment_officer').setValidators([Validators.required]);
      this.form.get('comment_officer').updateValueAndValidity();
    } else if (this.isCommentRequired) {
      this.form.get('comment_officer').setValidators([Validators.required]);
      this.form.get('comment_officer').updateValueAndValidity();
    }

    const { employee } = this.auth

    this.SIGNATURE_URL = employee?.signatureFile?.downloadUrl || null
    const { uid } = this.auth;
    this.uid = uid;
  }

  get isReject(): boolean {
    return this.data?.mode === 'reject';
  }

  get currentWorkplaceIndex(): number {
    const workplaceKeys = this.store?.selectedCriminalRecord?.workplaceKeys || [];
    return workplaceKeys.findIndex((f: any) => f == this.auth?.currentDepartment?.key);
  }

  buildRejectTargets(): any[] {
    const { selectedCriminalRecord } = this.store;
    const workplaceKeys = selectedCriminalRecord?.workplaceKeys || [];
    const index = this.currentWorkplaceIndex;
    if (index < 1) return [];
    return workplaceKeys.slice(0, index).map((key: any) => {
      const workplace = selectedCriminalRecord?.workplaces?.find((f: any) => f?.department?.key == key);
      return {
        key: key,
        name: workplace?.department?.name || workplace?.department?.name_en || key,
      }
    })
  }

  get isValidDecreeRecord(): boolean {
    return this.store?.selectedCriminalRecord?.decree_status?.key === DECREE_STATUS_OBJ.valid_decree_record.key;
  }

  get isFinalApprover(): boolean {
    const workplaceKeys = this.store?.selectedCriminalRecord?.workplaceKeys || [];
    const currentIndex = workplaceKeys.findIndex((f: any) => f == this.auth?.currentDepartment?.key);
    return currentIndex > -1 && currentIndex === (workplaceKeys.length - 1);
  }

  get isCommentRequired(): boolean {
    return this.isValidDecreeRecord && !this.isFinalApprover;
  }

  get decreeStatusName(): string {
    return this.store?.selectedCriminalRecord?.decree_status?.name || null;
  }

  get decreeResultName(): string {
    return this.store?.selectedCriminalRecord?.decree_result?.name || null;
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
    this.SELECTED_STAMP = event;
  }

  async _onSave(f: any) {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.snackBar.open(`សូមបញ្ចូលយោបល់ជាមុនសិន`, "បិទ", { duration: 4000 });
      return;
    }
    if (this.isReject) {
      return this._onReject(f);
    }
    if (this.form.valid) {
      this.form.disable();
      const { remark_officer, remarkText, comment_officer } = f;
      const { uid, currentDepartment, employee, config, serverDateTime } = this.auth;
      const { selectedCriminalRecord } = this.store

      let signature = null
      if (this.SELECTED_SIGNATURE) {
        const file = await this.storage.upload([this.SELECTED_SIGNATURE])
        signature = file[0]
      } else {
        signature = employee?.signatureFile
      }

      const workplaceData = selectedCriminalRecord.workplaces?.map(m=>{
          if(m?.department?.key == currentDepartment.key){
            return{
              ...m,
              approved_at: serverDateTime,
              approved_by: this.auth.getMappedApprover(),
              default_stampFile: employee?.stampFile || null,
              default_remarkFile: employee?.signatureFile || null,
              default_signatureFile: signature || null,
              comment: comment_officer || null,
            }
          }
          return {
            ...m
          }
      });

      const currentWorkplaceIndex = selectedCriminalRecord?.workplaceKeys?.findIndex((f:any)=>f == currentDepartment?.key);
      const isFinal = currentWorkplaceIndex == (selectedCriminalRecord?.workplaceKeys?.length - 1);
      const nextWorkplace = isFinal ? null : (selectedCriminalRecord?.workplaceKeys[currentWorkplaceIndex+1] || null)
      
      const criminalData: Partial<ICriminalRecord> = {
        key: this.store.selectedCriminalRecord.key,
        updated_by: this.store?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
        tran_at: this.ds.serverTimestamp(),
        tran_by: this.auth?.getMappedProfile(),
        status: this.store.selectedCriminalRecord.status,
        citizen_ref: this.store.selectedCriminalRecord.citizen_ref,
        criminal_record_category: this.store.selectedCriminalRecord?.criminal_record_category,
        decree_result: this.store.selectedCriminalRecord.decree_result,
        decree_status: this.store.selectedCriminalRecord.decree_status,

        workplaces: workplaceData,
        request_approval_workplace_keys: nextWorkplace ? [nextWorkplace] : null,
        approved_officerKey: this.ds.fireFieldValue().arrayUnion(`${this.auth.uid}`),
        approved_officers: this.ds.fireFieldValue().arrayUnion(this.auth.getMappedApprover()),
        approved_workplaceKeys: this.ds.fireFieldValue().arrayUnion(`${currentDepartment.key}`),
        last_approved_at: this.ds.serverTimestamp(),
        internal_status: isFinal ? STATUS_OBJ.APPROVED : STATUS_OBJ.PROCESSING,
      }

      this.store.approvalCriminalRecordDigitalFlow(criminalData).then(()=>{
          this.snackBar.open(`បានពិនិត្យ និងអនុម័តដោយជោគជ័យ`, "ជោគជ័យ", { duration: 6000 });
          this.form.reset();
          this.dialogRef.close();
          const segments = this.router.url.split(/[?#]/)[0].split('/').filter(Boolean);
          this.router.navigate(['/', ...segments.slice(0, -2)])
      }).catch((e: any)=>{
          this.snackBar.open(`រក្សាទុកបានបរាជ័យ សូមព្យាយាមម្តងទៀត`, "បិទ", { duration: 6000 });
          this.form.reset();
      })
    }
  }

  async _onReject(f: any) {
    const { comment_officer, reject_to_workplace_key } = f;
    const { currentDepartment } = this.auth;
    const { selectedCriminalRecord } = this.store;

    const workplaceKeys = selectedCriminalRecord?.workplaceKeys || [];
    const currentIndex = this.currentWorkplaceIndex;
    const targetIndex = workplaceKeys.findIndex((m: any) => m == reject_to_workplace_key);

    if (currentIndex < 1 || targetIndex < 0 || targetIndex >= currentIndex) {
      this.snackBar.open(`ពុំមានអង្គភាពសម្រាប់បដិសេធ`, "បិទ", { duration: 6000 });
      return;
    }

    this.form.disable();

    // every step from the target up to (and including) the current one is undone
    const rollbackKeys = workplaceKeys.slice(targetIndex, currentIndex + 1);
    const targetWorkplace = this.rejectTargets?.find((m: any) => m?.key == reject_to_workplace_key) || null;

    const workplaceData = selectedCriminalRecord.workplaces?.map((m: any) => {
      if (rollbackKeys.includes(m?.department?.key)) {
        return {
          ...m,
          approved_at: null,
          approved_by: null,
          default_stampFile: null,
          default_remarkFile: null,
          default_signatureFile: null,
          comment: null,
        }
      }
      return {
        ...m
      }
    });

    const criminalData: Partial<ICriminalRecord> = {
      key: selectedCriminalRecord.key,
      updated_by: this.store?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      tran_at: this.ds.serverTimestamp(),
      tran_by: this.auth?.getMappedProfile(),
      citizen_ref: selectedCriminalRecord.citizen_ref,
      criminal_record_category: selectedCriminalRecord?.criminal_record_category,
      decree_result: selectedCriminalRecord.decree_result,
      decree_status: selectedCriminalRecord.decree_status,
      status: selectedCriminalRecord.status,

      workplaces: workplaceData,
      request_approval_workplace_keys: [reject_to_workplace_key],
      approved_workplaceKeys: this.ds.fireFieldValue().arrayRemove(...rollbackKeys),
      rejected_workplaceKeys: this.ds.fireFieldValue().arrayUnion(`${currentDepartment.key}`),
      rejected_officerKey: this.ds.fireFieldValue().arrayUnion(`${this.auth.uid}`),
      rejected_officers: this.ds.fireFieldValue().arrayUnion(this.auth.getMappedApprover()),
      rejected_at: this.ds.serverTimestamp(),
      rejected_by: this.auth.getMappedApprover(),
      reject_reason: comment_officer || null,
      reject_to_workplace: targetWorkplace,
      // keeps the record at the top of the target department's request listing
      last_approved_at: this.ds.serverTimestamp(),
      internal_status: STATUS_OBJ.INTERNAL_PROCESS_REJECT,
    }

    console.log("criminalData",criminalData);

    this.store.rejectCriminalRecordDigitalFlow(criminalData).then(() => {
      this.snackBar.open(`បានបដិសេធព្រឹត្តិបត្រដោយជោគជ័យ`, "ជោគជ័យ", { duration: 6000 });
      this.form.reset();
      this.dialogRef.close();
      const segments = this.router.url.split(/[?#]/)[0].split('/').filter(Boolean);
      this.router.navigate(['/', ...segments.slice(0, -2)])
    }).catch((e: any) => {
      this.snackBar.open(`រក្សាទុកបានបរាជ័យ សូមព្យាយាមម្តងទៀត`, "បិទ", { duration: 6000 });
      this.form.enable();
    })
  }
}
