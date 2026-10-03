import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WindowService } from 'src/app/shared/services/window.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss']
})
export class SignInFormComponent implements OnInit {
  form: FormGroup;
  error: string = null;
  process: boolean = false;
  title = "ចូលប្រព័ន្ធតាមគណនី"

  constructor(public dialogRef: MatDialogRef<SignInFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: AuthStore,
    private router: Router,
    private win: WindowService,
    private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, Validators.required],
    })
  }


  _onSignIn(f: any) {
    if (this.form.valid) {
      this.error = null;
      this.form.disable();
      this.process = true;
      this.store.signIn(f, async (success, error) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.router.navigate(['/'])
          this.dialogRef.close()
        }
        else {
          this.error = "គណនីនិងពាក្យសម្ងាត់របស់លោកអ្នកមិនមាននៅក្នុងប្រព័ន្ធទេ";
        }
      })
    }
    else {
      this.form.enable();
      this.error = null;
      this.process = false;
    }
  }

}
