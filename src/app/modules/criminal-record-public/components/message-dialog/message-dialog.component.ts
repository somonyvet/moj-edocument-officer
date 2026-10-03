import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnimationOptions } from 'ngx-lottie';
import { AuthStore } from 'src/app/stores/auth.store';
import { LanguageStore } from 'src/app/languages/translate.store';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  label_en:string = null;
  label_kh:string = null;

  subLabel_en:string = null;
  subLabel_kh:string = null;

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/announcement.json',
  };

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public auth: AuthStore,
    public tran : LanguageStore,
  ) { }


  ngOnInit(): void {
    this.subLabel_en = this.auth?.config?.announcement?.subLabel_en;
    this.subLabel_kh = this.auth?.config?.announcement?.subLabel_kh;
    this.label_en = this.auth?.config?.announcement?.label_en;
    this.label_kh = this.auth?.config?.announcement?.label_kh;
  }

}
