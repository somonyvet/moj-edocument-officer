import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { ConvertService, pushObjArray, removeObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';

import { statusObj, driveObj, PERMISSION_OPTIONS } from 'src/app/dummy/status';
import { IShareFile } from 'src/app/interfaces/file-manager';

@Component({
  selector: 'app-stop-share-my-file',
  templateUrl: './stop-share-my-file.component.html',
  styleUrls: ['./stop-share-my-file.component.scss']
})
export class StopShareMyFileComponent implements OnInit {
  form: FormGroup;
  user: AbstractControl;

  PERMISSION_OPTIONS: any[] = PERMISSION_OPTIONS
  DRIVE_OBJ = driveObj
  FILE: any;
  totalSize: number = 0;

  filteredUerStates: Observable<any[]>;
  SELECTED_USER: any[] = [];
  share_ref: IShareFile;
  file_ref:any;
  constructor(public dialogRef: MatDialogRef<StopShareMyFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: FileManager,
    public afs: AngularFirestore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private ds: DataService,
  ) { }

  async ngOnInit() {
    // this.FILE = this.data
    this.SELECTED_USER = []
    this.form = this.fb.group({
      pin: [null],
      publicShare: [null],
      permission: [PERMISSION_OPTIONS[0]],
      user: [{ value: null, disabled: false }, [MappingService.validSelected.bind(this)]],
      member: [null]
    })
    this.user = this.form.controls['user'];
    ;
    const { selectedCompany, uid } = this.auth;
    const userList = await this.store.fetchUserList(selectedCompany.key);
    this.filteredUerStates = MappingService.autoComplete(this.user, userList.filter(m => m.key !== uid), "full_name");
    const { shareRef, fileRef } = this.data;
    if (fileRef) {
      fileRef.get().then(doc => {
        this.FILE = doc.data();
        const { user, pin, publicShare,
          permission
        } = this.data;
        const filePermission = this.PERMISSION_OPTIONS.find(m => m.key === permission.key)
        this.form.patchValue({
          pin, publicShare, permission: filePermission,
        })
        this.SELECTED_USER = user;
      });
    }

    // const { shareRef } = this.data;
    // if (shareRef) {
    //   shareRef.get().then(doc => {
    //     this.share_ref = doc.data();
    //     const { user, pin, publicShare,
    //       permission
    //     } = this.share_ref;
    //     const filePermission = this.PERMISSION_OPTIONS.find(m => m.key === permission.key)
    //     this.form.patchValue({
    //       pin, publicShare, permission: filePermission,
    //     })
    //     this.SELECTED_USER = user;
    //   });
    // }
  }

  onSave(f: any) {
    if (this.form.valid) {
      const key = this.data ? this.data.key : this.afs.createId();
      const { selectedCompany, uid } = this.auth;
      const { pin, publicShare, permission, member } = f;
      const shareToPublic = publicShare || false;
      const tag = [
        key,
        this.auth.user.uid,
        ConvertService.toCapitalize(`${this.FILE.name}`.trim()),
        ConvertService.toDateKey(new Date()),
        `~N/A~`,
      ]
      if (shareToPublic === false && this.SELECTED_USER.length === 0) {
        alert("Please select account for share document.")
        return;
      }
      if (shareToPublic === false && this.SELECTED_USER.length > 50) {
        alert("Over limit share document to account. You can share only 50 accounts per share.")
        return;
      }
     this.form.disable();
      const item: IShareFile = {
        key: key,
        status: statusObj.active,
        isDelete: false,
        isFavorite: false,
        created_at: new Date(),
        created_by: this.auth.user,
        updated_by: this.auth.user,
        updated_at: new Date(),
        deleted_by: null,
        deleted_at: null,
        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: ConvertService.toCapitalize(name),
        tag: tag,
        size: this.FILE.size,
        companyKey: selectedCompany.key,
        companyRef: this.ds.companyRef().doc(selectedCompany.key).ref,
        //fields
        pin: pin || false,
        publicShare: publicShare || false,
        permission: permission,
        user: shareToPublic === false ? this.SELECTED_USER.map(m => ({ key: m.key, full_name: m.full_name, email: m.email, phone: m.phone })) : [],
        viewer: shareToPublic === false ? this.SELECTED_USER.map(m => m.key) : [],
        fileRef: this.ds.folderRef().doc(this.FILE.key).ref,
        fileKey: this.FILE.key,
      }
      this.store.shareDocument(item, this.data, (success, res) => {
        if (success) {
          this.form.enable();
          this.snackBar.open("File has been shared successful.", "Done", { duration: 2000 })
          this.dialogRef.close('yes')
        }
      })
    }

  }

  displaySubjectName(item: any): string {
    return item ? item.full_name : item;
  }

  onChanged(event) {
    const { checked } = event;
    if (checked) this.user.disable();
    else this.user.enable()
  }

  onSelectionChange(event, autoComplete) {
    const { value } = event.option;
    this.SELECTED_USER = pushObjArray(this.SELECTED_USER, value)
    this.user.reset();
  }

  onRemove(item) {
    this.SELECTED_USER = removeObjArray(this.SELECTED_USER, item.key)
  }

  stopshare(){
    this.store.StopPinShare(this.FILE , (success) => {
      if (success) {
            this.snackBar.open("File has been removed successfully.", "Done", { duration: 3000 });
            this.store.selectedItem = null;
      } else {
        this.snackBar.open("Fail to remove file.", "Done", { duration: 3000 });
      }
    })
    this.dialogRef.close('no')
  }
}
