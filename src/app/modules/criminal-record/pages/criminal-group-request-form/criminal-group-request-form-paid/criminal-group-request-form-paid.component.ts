import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { STATUS_LIVES_ARRAY, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CitizenStore } from '../../../stores/citizen.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-group-request-form-paid',
  templateUrl: './criminal-group-request-form-paid.component.html',
  styleUrls: ['./criminal-group-request-form-paid.component.scss']
})
export class CriminalGroupRequestFormPaidComponent implements OnInit {

  STATUS_OBJ = STATUS_OBJ
  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;
  show_confirm: boolean = false;
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/digitization-documents.json',
  };
  isKhmerForm: boolean = false;
  process: boolean = false;

  isTypeConfirm : boolean = false;
  isTypeReview : boolean = false;

  constructor(
    public ds: DataService,
    public auth: AuthStore,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
    private route : ActivatedRoute,
  ) { }

  async ngOnInit() {
    const { selectedCriminalRecord, attachment_files } = this.criminalStore;
    const { apply, status } = selectedCriminalRecord || {}
    this.show_confirm = apply && status?.key === STATUS_OBJ.APPLY.key;
    this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
    this.route.parent.parent.url.subscribe((urlPath) => {
      const url = urlPath[urlPath.length - 1].path;
      this.isTypeConfirm = url === 'apply-online'
      this.isTypeReview = url === 'apply-in-place'
    })
  }

}
