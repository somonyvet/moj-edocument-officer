import { Router } from '@angular/router';
import { AuthStore } from './../../../stores/auth.store';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WindowService } from 'src/app/shared/services/window.service';
import firebase from 'firebase/compat/app';

import { toNumber } from 'src/app/shared/services/mapping.service';
import { MatDialog } from '@angular/material/dialog';
import { SignInFormComponent } from '../../sign-in-form/sign-in-form.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SignupComponent } from '../signup/signup.component';
import { AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('code1') code1: ElementRef;
  @ViewChild('code2') code2: ElementRef;
  @ViewChild('code3') code3: ElementRef;
  @ViewChild('code4') code4: ElementRef;
  @ViewChild('code5') code5: ElementRef;
  @ViewChild('code6') code6: ElementRef;

  options: AnimationOptions = {
    path: '../../../../assets/bgsty.json',
  };


  form: UntypedFormGroup;
  error: string = null;
  process: boolean = false;

  formPhone: UntypedFormGroup;
  formCode: UntypedFormGroup;

  isSendCode: boolean = false;
  phoneNumber: string = null;
  windowRef: any;
  constructor(
    private fb: UntypedFormBuilder,
    public store: AuthStore,
    private router: Router,
    private win: WindowService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, Validators.required],
    })

    this.formPhone = this.fb.group({
      phone: [null, [Validators.required]],
    })

    this.formCode = this.fb.group({
      code1: [null, [Validators.required], this.onCode1.bind(this)],
      code2: [null, [Validators.required], this.onCode2.bind(this)],
      code3: [null, [Validators.required], this.onCode3.bind(this)],
      code4: [null, [Validators.required], this.onCode4.bind(this)],
      code5: [null, [Validators.required], this.onCode5.bind(this)],
      code6: [null, [Validators.required], this.onCode6.bind(this)],
    })
  }

  ngAfterViewInit() {
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    });
    this.code1?.nativeElement.focus()
  }

  ngAfterViewChecked() {
    this.changeRef.detectChanges();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(SignupComponent);
  }

  _onSignUp() {
    this.router.navigate([`/login/signup`])
  }

  onKeydown(event, code) {
    switch (code) {
      case 1:

        break;
      case 2:
        this.code1.nativeElement.focus()
        this.code1.nativeElement.select()
        break;
      case 3:
        this.code2.nativeElement.focus()
        this.code2.nativeElement.select()
        break;
      case 4:
        this.code3.nativeElement.focus()
        this.code3.nativeElement.select()
        break;
      case 5:
        this.code4.nativeElement.focus()
        this.code4.nativeElement.select()
        break;
      case 6:
        this.code5.nativeElement.focus()
        this.code5.nativeElement.select()
        break;
      default:
        break;
    }
  }


  onKeydownCode(event, index) {
    let value = this.formCode?.value;
    value[index] = event?.key;
    const { code1, code2, code3, code4, code5, code6 } = value;
    if (code1 && code2 && code3 && code4 && code5 && code6) {
      const { code1, code2, code3, code4, code5, code6 } = value;
      const code = `${code1}${code2}${code3}${code4}${code5}${code6}`;
      this.windowRef.confirmationResult.confirm(code).then(p => {
        const { user } = p;
        this.store.loginWithUser(user, res => { })
      }).catch(err => {
        this.error = err;
      });
    }
  }

  _signInWithPhone(f: any) {
    if (this.formPhone.valid) {
      this.error = null;
      this.formPhone.disable();
      this.process = true;
      const { phone } = f;
      var appVerifier = this.windowRef.recaptchaVerifier;
      this.phoneNumber = `+855${toNumber(phone)}`
      this.store.loginWithPhoneNumber(this.phoneNumber, appVerifier).then(res => {
        this.windowRef.confirmationResult = res;
        this.isSendCode = true;
        this.process = false;
        this.formPhone.enable()
      }).catch(err => {
        this.error = err;
        this.process = false;
        this.formPhone.enable()
      })
    }
  }

  _signInVerifyCode(f: any) {
    if (this.formCode.valid) {
      this.error = null;
      this.formPhone.disable();
      this.process = true;
      const { code1, code2, code3, code4, code5, code6 } = f;
      const code = `${code1}${code2}${code3}${code4}${code5}${code6}`;
      this.windowRef.confirmationResult.confirm(code).then(p => {
        const { user } = p;
        this.store.loginWithUser(user, res => { })
      }).catch(err => {
        this.error = err;
      });
    }
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

  onSignInWithUsername() {
    const dialogRef = this.dialog.open(SignInFormComponent, {
      data: null,
      panelClass: 'cs-dialog-wrapper',
      width: '480px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }


  async onCode1(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
        this.code2?.nativeElement?.focus()
        this.code2?.nativeElement?.select()
      } else {

      }
      return null;
    }
  }
  async onCode2(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
        this.code3.nativeElement.focus()
        this.code3.nativeElement.select()
      } else {
        this.code1.nativeElement.focus()
        this.code1.nativeElement.select()
      }
      return null;
    }
  }
  async onCode3(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
        this.code4.nativeElement.focus()
        this.code4.nativeElement.select()
      } else {
        this.code2.nativeElement.focus()
        this.code2.nativeElement.select()
      }
      return null;
    }
  }
  async onCode4(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
        this.code5.nativeElement.focus()
        this.code5.nativeElement.select()
      } else {
        this.code3.nativeElement.focus()
        this.code3.nativeElement.select()
      }
      return null;
    }
  }
  async onCode5(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
        this.code6.nativeElement.focus()
        this.code6.nativeElement.select()
      } else {
        this.code4.nativeElement.focus()
        this.code4.nativeElement.select()
      }
      return null;
    }
  }
  async onCode6(control: AbstractControl) {
    if (control) {
      const { value } = control;
      if (value) {
      } else {
        this.code5.nativeElement.focus()
        this.code5.nativeElement.select()
      }
      return null;
    }
  }
}
