import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { WindowService } from 'src/app/shared/services/window.service';
import firebase from 'firebase/compat/app';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AnimationOptions } from 'ngx-lottie';
import { AuthStore } from 'src/app/stores/auth.store';
import { SignupComponent } from 'src/app/pages/auth/signup/signup.component';

@Component({
    selector: 'app-criminal-record-latter-head',
    templateUrl: './criminal-record-latter-head.component.html',
    styleUrls: ['./criminal-record-latter-head.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalRecordLatterHeadComponent implements OnInit {
  options: AnimationOptions = {
    path: '../../../../assets/bgsty.json',
  };

  form: UntypedFormGroup;
  error: string = null;
  process: boolean = false;

  processItems: any[] = [false, false, false];
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
  }

  ngAfterViewInit() {
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    });
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

  // _signInWithGoogle(i) {
  //   this.processItems[i] = true;
  //   this.process = true;
  //   this.store.signInWithGoogleAccount((success, res) => {
  //     this.processItems[i] = false;
  //     this.process = false;
  //     if (success) {
  //       this.router.navigate(['/ecosystem'])
  //     } else {
  //       alert(res)
  //     }
  //   })
  // }

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
}
