import { Component, OnInit } from '@angular/core';
import { SYS_MODULES } from 'src/app/dummy/config';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalVerifyStore } from '../../../stores/criminalVerify.store';

@Component({
  selector: 'app-classify-criminal-remaining',
  templateUrl: './classify-criminal-remaining.component.html',
  styleUrls: ['./classify-criminal-remaining.component.scss']
})
export class ClassifyCriminalRemainingComponent implements OnInit {

  loading: boolean = true
  constructor(
    public criminal: CriminalStore,
    private auth: AuthStore,
    public store: CriminalVerifyStore) { }

  ngOnInit(): void {
    this.criminal.module = SYS_MODULES.CRIMINAL?.find(m => m?.key === 'folder');
    this.criminal.firstParams = { key: 'folder' }
    this.loading = false
  }

  ngOnDestroy(): void {
    this.criminal.firstParams = null;
  }

  _onSelectedCalendar(event) {
  }

}
