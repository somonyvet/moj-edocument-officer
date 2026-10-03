import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { AddEditUserAccountComponent } from 'src/app/modules/organization/user-account/add-edit-user-account/add-edit-user-account.component';
import { ChangePasswordComponent } from 'src/app/shared/components/change-password/change-password.component';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  URL : any;
  SIGNATURE_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  STAMP_URL

  SELECTED_PHOTO: any = null;


  constructor(
    private storage: FireStorageService,
    private ds: DataService,
    private officerStore: OfficerStore,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,

    public auth: AuthStore,

  ) { }

  ngOnInit(): void {
    this.URL = this.auth?.employee?.file?.downloadUrl || 'https://firebasestorage.googleapis.com/v0/b/sysanotta.appspot.com/o/no_image.svg?alt=media&token=f25af902-6c62-47e6-bdf3-48e3b0c6fe8c'
    this.SIGNATURE_URL = this.auth?.employee?.signatureFile?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
    this.STAMP_URL = this.auth?.employee?.stampFile?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
  }


  async onSelectedFile(event){
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.URL = event.target.result;
      }
      if (this.SELECTED_PHOTO) {
        if (this.auth?.employee?.file?.downloadUrl) {
          await this.storage.deleteFile(this.auth?.employee?.file);
        }
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        const { uid } = this.auth;
        const data: IOfficer = {
          ...this.auth.employee,
          updated_by: uid,
          updated_at: this.ds.serverTimestamp(),
          file: file[0]
        }
        await this.officerStore.save(data, (success, res) => {
          if (success) {
            this.snackBar.open(`Officer has been saved successful.`, "Done", { duration: 3000 });
            this.SELECTED_PHOTO = null;
          } else {
            alert(res);
          }
        })
      }
    }
  }

  onEditUser(){
    const dialogRef = this.dialog.open(AddEditUserAccountComponent,{
      data: { item: this.auth?.employee},
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus:false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onChangePW(){
    let dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus:false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onLogOut(){
    this.auth.signOut(() => {
      this.router.navigate(['/login'])
    });
  }
}
