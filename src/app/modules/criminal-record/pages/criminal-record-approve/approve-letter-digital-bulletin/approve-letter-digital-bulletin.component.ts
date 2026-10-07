import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
    selector: 'app-approve-letter-digital-bulletin',
    templateUrl: './approve-letter-digital-bulletin.component.html',
    styleUrls: ['./approve-letter-digital-bulletin.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApproveLetterDigitalBulletinComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    public store: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    // the verify QR printed on the bulletin lives on its own document
    this.route.parent?.params.subscribe(params => {
      if (params?.id) {
        this.store.fetchCriminalPrint(params?.id);
      }
    })
  }

  ngOnDestroy(): void {
    this.store?.fetchCriminalPrintRef?.unsubscribe();
  }

  get criminalRecord(): any {
    return this.store?.selectedCriminalRecord;
  }

  // the letter date is stamped when the bulletin is first printed; before that fall back to the final approval
  get criminalLetterDate(): any {
    return this.criminalRecord?.criminal_letter_date || this.criminalRecord?.last_approved_at || null;
  }
}
