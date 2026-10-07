import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { HrStore } from '../../../stores/hr.store';

@Component({
    selector: 'app-view-attachment',
    templateUrl: './view-attachment.component.html',
    styleUrls: ['./view-attachment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ViewAttachmentComponent implements OnInit {

  selectedOfficer : any = null;
  selectedImage : any = null;
  SVG = '../../../../../../assets/images/pdf-svgrepo-com.svg'

  lottie: AnimationOptions = {
    path: '../../../../../../assets/animate/109279-checklist.json',
  };

  constructor(
    public store : HrStore
  ) { }

  ngOnInit(): void {
    this.selectedOfficer = this.store?.selectedOfficer as any;
  }

}
