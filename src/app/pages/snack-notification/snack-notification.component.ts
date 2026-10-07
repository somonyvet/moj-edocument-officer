import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';

@Component({
    selector: 'app-snack-notification',
    templateUrl: './snack-notification.component.html',
    styleUrls: ['./snack-notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SnackNotificationComponent implements OnInit {

  link : string = ''
  constructor( public snackBarRef: MatSnackBarRef<SnackNotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,) { }

  ngOnInit(): void {
    this.data.profileImage = this.data?.profileImage ? transformImageSameTokenNo(this.data?.profileImage, '200')?.uri : null;
    this.link = ''
  }

}
