import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, take, debounceTime } from "rxjs/operators";
import { DataService } from 'src/app/shared/services/data.service';
import { toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  form: FormGroup;
  email: AbstractControl;
  password: AbstractControl;
  confirm: AbstractControl;

  hide: boolean = true;
  process: boolean = false;
  constructor(private fb: FormBuilder,
    private router: Router,
    public store: AuthStore,
    private ds: DataService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.minLength(5)], this.checkExistRef()],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirm: [null, [Validators.required, Validators.minLength(6)]]
    }, { validators: this.checkPasswords })

    this.email = this.form.controls['email']
    this.password = this.form.controls['password']
    this.confirm = this.form.controls['confirm']
  }

  _onSave(f: any) {
    if (this.form.valid) {
      this.process = true;
      this.form.disable();
      this.store.signup(f, (success, error) => {
        if (success) {
          this.router.navigate([`/`])
        } else {
          alert(error)
        }
        this.process = false;
        this.form.enable()
      })
    }
  }

  _onSignIn() {
    this.router.navigate([`/login`])
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirm')?.value
    return pass === confirmPass ? null : { notSame: true }
  }

  checkExistRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value) {
        return this.ds.userRef(ref => ref.where('email', '==', `${toNameKey(value)}@immigration.gov.kh`))
          .get()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      } else {
        return null;
      }
    }
  }


}
