import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { LanguageStore } from 'src/app/languages/translate.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-withdraw-address-display',
    templateUrl: './withdraw-address-display.component.html',
    styleUrls: ['./withdraw-address-display.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WithdrawAddressDisplayComponent implements OnInit {
  @Input() embassyKey;
  embassy = null
  constructor(
    private store : CriminalApplicationStore,
    public lang: LanguageStore,
    public auth: AuthStore,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
  }

  async ngOnChanges(changes: SimpleChanges){
    if(changes?.embassyKey?.currentValue){
      this.embassy = await this.store.getSelectedEmbassy(this.embassyKey)
    }
  }
}
