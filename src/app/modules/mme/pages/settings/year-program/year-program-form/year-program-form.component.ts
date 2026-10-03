
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { map, take, debounceTime } from "rxjs/operators";
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Router } from '@angular/router';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { MmeProgramStore } from 'src/app/stores/document/mme-program.store';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IYearProgram } from 'src/app/modules/mme/interfaces/document.interface';
import { PROJECT_STATUS_OBJECT } from 'src/app/dummy/status';

@Component({
  selector: 'app-year-program-form',
  templateUrl: './year-program-form.component.html',
  styleUrls: ['./year-program-form.component.scss']
})
export class YearProgramFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('attachmentFile') attachmentFile: ElementRef;

  title: any = "បង្កើតឆ្នាំសម្រាប់កម្មវិធី";
  form: FormGroup;
  uploadedAttachment: any[] = [];
  selectedFiles: any[] = [];
  // filterFiles = ATTACHMENT_FILTER;
  process: boolean = false;
  attachmentSize: number = 0;
  public attachmentToDisplay: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<YearProgramFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: MmeProgramStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private db: DatabaseService,
    private router: Router,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, [Validators.required], this.checkExistRef()],
      year: [null, [Validators.required], this.checkExistYearRef()],
      setActive: [null],
      description: [null]
    })
    if (this.data?.item) {
      this.title = "កែប្រែឆ្នាំសម្រាប់កម្មវិធី"
      const item = this.data.item as any;
      const { name, year, setActive, description } = item;
      this.form.patchValue({
        name,
        year,
        setActive,
        description
      })
      this.data?.item?.attachment?.length > 0 ? this.uploadedAttachment.push(...this.data?.item?.attachment) : this.uploadedAttachment = []
      this.data?.item?.attachment?.length > 0 ? this.attachmentToDisplay.push(...this.data?.item?.attachment) : this.attachmentToDisplay = []
      this.attachmentSize = this.data?.item?.attachmentSize || 0;
    }
  }

  checkExistRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value) {
        return this.db.mmeYearFilterRef(ref => ref.where('nameKey', '==', toNameKey(value)))
          .get()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const item = this.data?.item as any;
              if (item?.nameKey === toNameKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      } else {
        return null;
      }
    };
  }
  checkExistYearRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value) {
        return this.db.mmeYearFilterRef(ref => ref.where('nameKey', '==', toNameKey(value)))
          .get()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const item = this.data?.item as any;
              if (item?.nameKey === toNameKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      } else {
        return null;
      }
    };
  }

  invalidFiles(event) {
    let str = event[0].name;
    for (let i = 1; i < event.length; i++) {
      str += ', ' + event[i].name;
    }
    this.snackBar.open(`Files not support  "${str}" `, 'done', { duration: 5000 });
  }

  // async uploadFileAtt(files) {
  //   if (files && files.length > 0) {
  //     this.process = true;
  //     let totalSelectFileSize = 0
  //     let tempFiles: any[] = [];
  //     for (let index = 0; index < files.length; index++) {
  //       const file_attach = files[index];
  //       tempFiles.push(file_attach)
  //       totalSelectFileSize += file_attach.size
  //     }
  //     if (totalSelectFileSize < (APPS.ATTACHMENT_SIZE_ALLOW - this.attachmentSize)) {
  //       for (let item of tempFiles) {
  //         this.attachmentToDisplay.unshift(item);
  //         this.selectedFiles.push(item);
  //       }
  //       this.attachmentSize += totalSelectFileSize;
  //     }
  //     else {
  //       this.snackBar.open('Files size is larger than available space.', 'done', { duration: 2000 });
  //     }
  //     this.process = false;
  //     this.attachmentFile.nativeElement.value = "";
  //   }
  // }

  deleteFile(file) {
    if (file?.downloadUrl) {
      this.attachmentToDisplay = this.attachmentToDisplay.filter(e => (e?.downloadUrl || '') !== file?.downloadUrl);
      this.uploadedAttachment = this.uploadedAttachment.filter(e => e?.downloadUrl !== file?.downloadUrl);
      this.attachmentSize != file.fileSize
    } else {
      this.attachmentToDisplay = this.attachmentToDisplay.filter(e => (e?.lastModified || '') !== file?.lastModified);
      this.selectedFiles = this.selectedFiles.filter(e => e.lastModified !== file?.lastModified)
      this.attachmentSize != file.size
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      this.process = true;
      const { name, year, setActive, description } = f;
      const item: IYearProgram = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IYearProgram = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([name, year]),
        isDelete: item?.isDelete || false,
        //fields
        name: name,
        year: year,
        nameKey: toNameKey(name),
        yearKey: toNameKey(year),
        projectStatus: item?.projectStatus || PROJECT_STATUS_OBJECT.HOLD,
        setActive: setActive || false,
        description: description || null,
      }

      if (item && item?.attachment?.length !== this.uploadedAttachment?.length) {
        for (let doc of item?.attachment) {
          if (!this.uploadedAttachment.find(element => element.downloadUrl === doc.downloadUrl)) {
            this.storage.storageRef(doc?.filename).delete();
          }
        }
      }
      if (this.selectedFiles.length > 0) {
        try {
          const files = await this.storage.upload(this.selectedFiles);
          this.uploadedAttachment = this.uploadedAttachment.concat(files);
        } catch (e) {
        }
      }
      const finalData = {
        ...data,
        attachment: this.uploadedAttachment,
        attachmentSize: this.attachmentSize,
      }
      this.store.saveYear(finalData, (success, res) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.snackBar.open(`Year for Program has been saved successful.`, "Done", { duration: 3000 });
          if (this.data.req) {
            this.router.navigate([`/planing/programs/${data?.key}`])
          }
          this.form.reset();
          this.inputRef.nativeElement.focus();
          this.uploadedAttachment = [];
          this.selectedFiles = [];
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res);
        }
      })
    }
  }
}
