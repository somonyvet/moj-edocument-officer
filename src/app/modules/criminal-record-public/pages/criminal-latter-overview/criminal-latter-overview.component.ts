import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { OverviewStore } from '../../store/overview.store';

@Component({
  selector: 'app-criminal-latter-overview',
  templateUrl: './criminal-latter-overview.component.html',
  styleUrls: ['./criminal-latter-overview.component.scss']
})
export class CriminalLatterOverviewComponent implements OnInit, OnDestroy {

  STATUS_OBJ = STATUS_OBJ;
  loading: boolean = true;

  statusIndex: number = -1;
  showMovement: boolean = false;

  STATUS_DISPLAY = [
    { key: 6, text: 'Apply', name: 'ដាក់ពាក្យស្នើសុំ', name_en: 'Apply' },
    {
      key: 6.1,
      text: 'Confirm',
      name: 'ផ្ទៀងផ្ទាត់ពាក្យស្នើស៉ំពីមន្រី្ដ',
      name_en: 'Confirm',
    },
    { key: 7, text: 'Review', name: 'ផ្ដល់ស្នាមម្រាមដៃនិងឯកសារ', name_en: 'Review' },
    { key: 10, text: 'Approved', name: 'ចេញព្រឹត្តិបត្រថ្កោលទោស', name_en: 'Approved' },
    { key: 11, text: 'Received', name: 'ដកព្រឹត្តិបត្រថ្កោលទោស', name_end: 'Received' },
  ]

  constructor(
    public auth: AuthStore,
    public store: OverviewStore,
    private router: Router
  ) { }

  ngOnInit(): void {
    const { profile } = this.auth;
    if (profile?.criminal_record) {
      this.store.fetchSelectedCriminal(profile?.criminal_record?.key, res => {
        if (res) {
          this.showMovement = res.status?.key !== STATUS_OBJ?.DRAFT?.key;
        } else {
          this.showMovement = false;
        }
        this.statusIndex = this.STATUS_DISPLAY.findIndex(f => f?.key === res?.status?.key);
        this.loading = false;
      })
    } else {
      this.loading = false;
    }
  }

  _onNext() {
    const { profile } = this.auth;
    if (profile?.criminal_record) {
      const { criminal_record } = profile;
      this.router.navigate([`/ecosystem/criminal-record-form/${criminal_record?.nationalKey}/${criminal_record?.application_type_key}/${profile?.key}/${criminal_record?.key}`])
      return;
    }
  }

  async ngOnDestroy() {
    await this.store.unsubscribe()
  }
}
