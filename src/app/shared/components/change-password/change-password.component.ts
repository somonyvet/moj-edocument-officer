import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  processClose: boolean;

  constructor(public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      oldPassword: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      confirm: [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    })
  }

  onSave(f: any) {
    if (this.form.valid) {
      const { password, confirm,oldPassword } = f;
      if (password !== confirm) {
        alert('New Password and Confirm Password do not match');
        return;
      }
      this.form.disable();
      this.auth.changePassword(oldPassword,password, (success, error) => {
        if (success) {
          this.snackBar.open("Password has been changed successfully.", "Done", { duration: 3000 })
          this.dialogRef.close('yes')
        }
        this.form.enable()
      })
    }
  }
}
