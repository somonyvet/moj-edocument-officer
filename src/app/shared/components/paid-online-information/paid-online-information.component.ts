import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';

@Component({
    selector: 'app-paid-online-information',
    templateUrl: './paid-online-information.component.html',
    styleUrls: ['./paid-online-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PaidOnlineInformationComponent implements OnInit, OnDestroy {

  khmer_amount = 0
  france_amount = 0
  english_amount = 0

  recipientName = ''
  recipientPhoto = ''
  applicationType = ''
  genderText = ''
  dobText = ''
  nationalityText = ''

  deliveryAddress: any = null
  deliveryTicket: any = null
  deliveryEstimateDate: Date = null

  subToStatus: Subscription = null;

  constructor(
    public store: CriminalApplicationStore,
  ) { }

  ngOnInit(): void {
    this.subToStatus = this.store.subscribeStatus?.subscribe(res=>{
      const { selectedCriminalRecord } = this.store
      this.khmer_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 1)?.amount || 1
      this.france_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 2)?.amount || 0
      this.english_amount = selectedCriminalRecord?.criminal_language?.find(f => f.key === 3)?.amount || 0

      this.recipientName = `${selectedCriminalRecord?.last_name || ''} ${selectedCriminalRecord?.first_name || ''}`.trim()
      this.mapDelivery(selectedCriminalRecord)
      this.recipientPhoto = selectedCriminalRecord?.photo?.photoUrl || selectedCriminalRecord?.photo?.downloadUrl || ''
      this.applicationType = selectedCriminalRecord?.application_type?.text || ''
      this.genderText = selectedCriminalRecord?.gender?.name || ''
      this.dobText = this.formatDob(selectedCriminalRecord?.dateOfBirthDay, selectedCriminalRecord?.dateOfBirthMonth, selectedCriminalRecord?.dateOfBirthYear)
      this.nationalityText = selectedCriminalRecord?.current_nationality?.kh_nationality || selectedCriminalRecord?.current_nationality?.nationality || ''
    })
  }

  private mapDelivery(record: any) {
    this.deliveryAddress = record?.delivery_address || record?.deliveryAddress || null
    this.deliveryTicket = record?.delivery_ticket || record?.deliveryTicket || null
    this.deliveryEstimateDate = this.toDate(this.deliveryTicket?.estimate_date)
  }

  get isInternationalDelivery(): boolean {
    return !!this.deliveryAddress?.country
  }

  get isDomesticDelivery(): boolean {
    return !!this.deliveryAddress && !this.isInternationalDelivery
  }

  get domesticAddressLine(): string {
    const address = this.deliveryAddress;
    if (!address) return '';
    return [
      address?.home_no,
      address?.street_no,
      this.geoName(address?.village),
      this.geoName(address?.commune),
      this.geoName(address?.district),
      this.geoName(address?.province),
    ].filter(Boolean).join(', ');
  }

  geoName(item: any): string {
    if (!item) return '';
    return item?.name;
  }

  get internationalAddressLine(): string {
    const address = this.deliveryAddress;
    if (!address) return '';
    return [
      address?.address1,
      address?.postal_code,
      address?.country?.en_short_name,
    ].filter(Boolean).join(', ');
  }

  private toDate(value: any): Date {
    if (!value) return null
    if (typeof value?.toDate === 'function') return value.toDate()
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  private formatDob(day: any, month: any, year: any): string {
    const parts = [day?.name, month?.name, year?.name].filter(Boolean)
    return parts.join(' ')
  }

  ngOnDestroy(){
    this.subToStatus?.unsubscribe
  }
}
