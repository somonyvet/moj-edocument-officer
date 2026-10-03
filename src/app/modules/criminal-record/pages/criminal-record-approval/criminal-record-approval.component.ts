import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { Observable } from 'rxjs';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-approval',
  templateUrl: './criminal-record-approval.component.html',
  styleUrls: ['./criminal-record-approval.component.scss']
})
export class CriminalRecordApprovalComponent implements OnInit {
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
    public dialogRef: MatDialogRef<CriminalRecordApprovalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
    public store: CriminalApplicationStore,

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
      const { uid, currentDepartment, employee } = this.auth;
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

      // if (this.SELECTED_STAMP) {
      //   if (data?.remarkFile) {
      //     await this.storage.deleteFile(data.remarkFile);
      //   }
      //   const file = await this.storage.upload([this.SELECTED_STAMP])
      //   data.remarkFile = file[0]
      // }

      this.store.approvalFolderByOwner(data, selectedGroupDoc, employee, currentDepartment, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`បានពិនិត្យ និងឯកភាពដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close();
        } else {
          alert(res);
        }
      })

    }
  }
}
