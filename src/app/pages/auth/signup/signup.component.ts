import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  constructor(private _bottomSheetRef: MatBottomSheetRef<SignupComponent>,
    public store: AuthStore) { }
  ngOnInit() {

  }
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  onNoClick(){
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
