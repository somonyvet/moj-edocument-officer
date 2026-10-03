import { Component, Inject, OnInit } from '@angular/core';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { APPLY_OBJECT, CRIMINAL_APPLICATION_LANGUAGE_ARRAY, MANUAL_PAID, STATUS_OBJ, URGENT_OBJ_ARRAY } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MappingService, mapToCountryData, mapToEmbassyData, mapToPaymentOption, pageKey, toDateKey, toNumber, toYearKey, workingDay } from 'src/app/shared/services/mapping.service';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { LanguageStore } from 'src/app/languages/translate.store';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-manual-paid-online',
  templateUrl: './manual-paid-online.component.html',
  styleUrls: ['./manual-paid-online.component.scss']
})
export class ManualPaidOnlineComponent implements OnInit {
  form: FormGroup;
  NATIONALITY_APPLICAITON: any = NATIONALITY_APPLICAITON
  STATUS_OBJ = STATUS_OBJ;
  URGENT_OBJ_ARRAY = URGENT_OBJ_ARRAY;
  APPLY_OBJECT = Object.values(APPLY_OBJECT)

  showOversea: boolean = true;
  filterCountry: any = null;
  filterEmbassy: any = null;

  selectedInvoice: any = null;
  retrieve_address: string;
  priceOptions: any = [];
  selectedPaymentOption: any = null;
  loading: boolean = true;
  formPayment: FormGroup;
  // confirmAgreement: FormControl = new FormControl()
  subscribeForm = null;

  withdraw_date: any = null;
  holidays: any = [];
  process: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ManualPaidOnlineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private fb : FormBuilder,
    public lang: LanguageStore,
    private ds: DatabaseService
  ) { }

  async ngOnInit(): Promise<void> {
    const { selectedCriminal } = this.data;
    this.selectedInvoice = await this.store.getCriminalInvoice(selectedCriminal?.key)
    const { serverDateTime } = this.auth;
    this.form = this.fb.group({
      isStudent: [ this.selectedInvoice?.isStudent || false ],
      nationality: [ this.NATIONALITY_APPLICAITON?.find(f=>f?.key === this.selectedInvoice?.nationality?.key) || this.NATIONALITY_APPLICAITON[0], Validators?.required],
      urgent_obj: [ this.URGENT_OBJ_ARRAY?.find(f=>f?.key === this.selectedInvoice?.urgent_obj?.key) || this.URGENT_OBJ_ARRAY[1], Validators.required],
      apply_from: [ this.APPLY_OBJECT?.find(f=>f?.key === this.selectedInvoice?.apply_from?.key) || this.APPLY_OBJECT[0], Validators.required],
      khmer_form: [{ value: true, disabled: true }],
      khmer_amount: [ this.selectedInvoice?.khmer_amount || 1, [Validators.required, Validators.min(1)]],
      france_form: [ this.selectedInvoice?.france_amount ? true : false ],
      france_amount: [ this.selectedInvoice?.france_amount || null, [Validators.required, Validators.min(1)]],
      english_form:  [ this.selectedInvoice?.english_amount ? true : false],
      english_amount: [ this.selectedInvoice?.english_amount || null, [Validators.required, Validators.min(1)]],
      application_country: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      application_embassy: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      paid_remark: [null, [Validators.required]],
    })

    let selectedEmbassy = null;
    if(this.selectedInvoice?.application_country?.key){
      this.filterEmbassy = await this.store?.getEmbassyByCountryKey(this.selectedInvoice?.application_country?.key)
      selectedEmbassy = this.filterEmbassy?.find(f=>f?.key === this.selectedInvoice?.application_embassy?.key)
    }

    this.form.patchValue({
      application_country: this.selectedInvoice?.application_country || null,
      application_embassy: selectedEmbassy || null,
    })

    this.form.get('application_country')?.valueChanges.pipe(
      debounceTime(300),
      tap(() => false),
      switchMap((value) =>
        this.store.fetchFilterDropdownData('countries', value, 'en_short_name')
      )
    )
    .subscribe((res) => {
      this.filterCountry = res;
    });

    if(this.form.get('apply_from')?.value?.key === APPLY_OBJECT.local?.key){
      this.showOversea = false;
      this.form.get('application_country').disable()
      this.form.get('application_embassy').disable()
    }else{
      this.showOversea = true;
      this.form.get('application_country').enable()
      this.form.get('application_embassy').enable()
    }

    if(!this.form.get('france_form').value){
      this.form.get('france_amount').disable();
    }

    if(!this.form.get('english_form').value){
      this.form.get('english_amount').disable();
    }

    this.form?.valueChanges?.subscribe(res=>{
      // this.checkOversea()
      this.calculatePayment();
    })
    this.priceOptions = await this.store?.getPaymentOptions()
    this.filterCountry = await this.store.fetchFilterDropdownData('countries', null, 'en_short_name')
    this.calculatePayment();
    this.holidays = await this.store.fetchHoliday(toYearKey(serverDateTime))
    if(serverDateTime.getMonth() == 11){
      const nextYearHoliday = await this.store.fetchHoliday(toYearKey(serverDateTime)+1)
      this.holidays = this.holidays?.concat(nextYearHoliday?.length ? nextYearHoliday : [])
    }
    this.calculateWithdrawDate();
    this.loading= false;
  }

  async calculateWithdrawDate(val?){
    const { serverDateTime } = this.auth;
    this.withdraw_date = workingDay(this.holidays, serverDateTime, val?.key || this.form?.get('urgent_obj')?.value?.key || 20)
  }

  // checkOversea(){
  //   const { apply_from } = this.form?.value;
  //   console.log('apply_from',apply_from)
  //   if(apply_from?.key === APPLY_OBJECT?.oversea.key){
  //     this.paymentOptions = BANK_OPTION?.filter(f=>f?.key !== 1)
  //     const visaPayment = BANK_OPTION?.find(f=>f?.key === 3)
  //     this.formPayment.get('paymentOption').patchValue(visaPayment)
  //   }else{
  //     this.paymentOptions = BANK_OPTION;
  //   }
  // }

  total_khmer
  total_english
  total_france
  grandTotal
  calculatePayment(){
    if(this.process) return;
    const apply_from = this.form?.get('apply_from')?.value;
    const nationality = this.form?.get('nationality')?.value;
    const urgent_obj = this.form?.get('urgent_obj')?.value;
    const isStudent = this.form?.get('isStudent')?.value;
    this.selectedPaymentOption = this.priceOptions?.find(f=>(f?.duration?.key === urgent_obj?.key) && (f?.nationality?.key === nationality?.key) && (apply_from?.key === f?.apply_from?.key) && (isStudent === f?.isStudent))
    this.total_khmer = this.form?.get('khmer_amount')?.value * this.selectedPaymentOption?.khmer_price
    this.total_english = ( this.form?.get('english_form')?.value ? this.form?.get('english_amount')?.value : 0 ) * this.selectedPaymentOption?.english_price
    this.total_france = ( this.form?.get('france_form')?.value ? this.form?.get('france_amount')?.value : 0 ) * this.selectedPaymentOption?.france_price
    this.grandTotal = this.total_khmer + this.total_english + this.total_france + this.selectedPaymentOption?.tran_fee
  }

  applyObjectChanges(e){
    if(e?.value?.key === APPLY_OBJECT.oversea?.key){
      this.showOversea = true;
      this.form.get('application_country').enable()
      this.form.get('application_embassy').enable()
      this.retrieve_address = this.form?.get('application_embassy')?.value? this.form?.get('application_embassy')?.value?.address : this.auth?.config?.retrieve_document_address;
    }else{
      this.showOversea = false;
      this.form.get('application_country').disable()
      this.form.get('application_embassy').disable()
      this.retrieve_address = this.auth?.config?.retrieve_document_address;
    }
  }

  async optionSelectedCountry(e){
    this.filterEmbassy = [];
    if(e?.key){
      this.filterEmbassy = await this.store.getEmbassyByCountryKey(e?.key);
      if(!this.filterEmbassy?.length){
        const message = `${this.lang?.strings?.['noEmbassyInThisCountry']} ${e?.en_short_name}`
        alert(message)
      }
    }
  }

  displayItemCountry(item: any): string {
    return item ? item?.en_short_name : item;
  }

  displayItem(item: any): string {
    return item ? item?.name : item;
  }

  onChangeLanguage(event: MatCheckboxChange, type: string) {
    if (event?.checked) {
      this.form.controls[type].enable();
    } else {
      this.form.controls[type].disable();
    }
  }

  async _onSave(f){
    if(this.form?.invalid || this.process){
      this.form.markAllAsTouched()
      return
    }
    this.process = true
    await this.auth.getServerTime()
    const { selectedCriminal,selectedCitizenProfile } = this.data
    const { config,serverDateTime } = this.auth
    const { urgent_obj } = f
    await this.store.getFolderKeyRef(serverDateTime, config, urgent_obj, async criminal_folder_no => {
      let selected_language = []
      const khmer_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
        amount: f?.khmer_amount,
      }
      selected_language.push(khmer_language_obj);
      if (f?.france_form) {
        const france_language_obj = {
          ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
          amount: f?.france_amount,
        }
        selected_language.push(france_language_obj);
      }
      if (f?.english_form) {
        const english_language_obj = {
          ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
          amount: f?.english_amount,
        }
        selected_language.push(english_language_obj);
      }
      const { isStudent,nationality,urgent_obj,apply_from,application_country,application_embassy,paid_remark} = f;
      const withdraw_date = workingDay(this.holidays, serverDateTime, urgent_obj?.key || 20)

      const receivedBy = {
        key: "acleda",
        display_name: "ACLEDA",
        name: "ACLEDA",
        photoUrl: null,
      };

      let invoiceId = this.selectedInvoice?.invoice_id
      if(!invoiceId){
        invoiceId = await this.store?.getInvoiceNumber();
      }

      const invoice: any = {
        key: this.selectedInvoice?.key || this.ds.createId(),
        invoice_id: invoiceId,
        isDelete: false,
        created_at: this.selectedInvoice?.created_at?.toDate() || serverDateTime,
        created_by: this.selectedInvoice?.created_by || this.store?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),
        date_key: toDateKey(serverDateTime),
        page_key: pageKey(),

        urgent_obj: urgent_obj,
        criminal_language: selected_language,
        apply_from: apply_from,
        isStudent: isStudent || false,
        national_application: nationality,
        bank_option: null,
        payment_option: mapToPaymentOption(this.selectedPaymentOption),
        total_amount: this.grandTotal,
        criminalRef: selectedCriminal?.key,

        status: STATUS_OBJ?.PAID,
        paid_at: this.ds.serverTimestamp(),
        paid_by: receivedBy,

        paid_online: true,
        paid_bank: receivedBy,
        paid_remark: paid_remark || null,
        paid_amount: this.grandTotal,
      }

      const item = {
        ...selectedCriminal,
        status: STATUS_OBJ?.PAID,
        apply_at: selectedCriminal?.apply_at || this.auth.serverDateTime,
        apply_by: this.store.getMappedProfile(),

        isStudent: isStudent || false,
        national_application: nationality || null,
        criminal_language : selected_language,
        urgent_obj: urgent_obj || null,
        apply_from: apply_from || null,

        application_country: mapToCountryData(application_country),
        application_embassy: mapToEmbassyData(application_embassy),
        pay_option: MANUAL_PAID,
        selected_payment_option_key: this.selectedPaymentOption?.key || null,

        withdraw_date: withdraw_date,
        withdraw_date_key: toDateKey(withdraw_date),
        shift_name: config.criminal_working_hours?.afternoon_shift || null,
        criminal_folder_no: criminal_folder_no,
        folder_key_ref: null,

        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(serverDateTime),

        manual_paid_at: this.ds.serverTimestamp(),
        manual_paid_by: this.store.getMappedProfile(),

        paid_at: this.ds.serverTimestamp(),
        paid_by: this.store.getMappedProfile(),

        receipt_ref: invoice?.key,
        receipt_amount: this.grandTotal,

        paid_online: true,
        paid_bank: receivedBy,
        paid_remark: paid_remark || null,
        paid_amount: this.grandTotal ? toNumber(this.grandTotal) : null,
        payment_option: mapToPaymentOption(this.selectedPaymentOption)
      }

      const SYSTEM = {
        key: "system",
        display_name: "SYSTEM",
        name: "SYSTEM",
        photoUrl: null,
      };

      const movement = {
        key: this.ds.createId(),
        created_at: this.ds.serverTimestamp(),
        created_by: SYSTEM,
        profile: SYSTEM,
        workplaceKey: null,
        workplace: null,
        criminalRecordKeyRef: selectedCriminal?.key,
        citizenKeyRef: selectedCitizenProfile?.key,
        criminalStatus: selectedCriminal?.status,

        criminalCategory: selectedCriminal?.criminal_record_category,
        criminalSkipWorkplace: config?.criminal_record_category_labor?.key === selectedCriminal?.criminal_record_category?.key,

        decree_status: null,
        decree_result: null,
        internal_status: selectedCriminal?.internal_status || null,

        default_stampFile: null,
        default_remarkFile: null,
        default_signatureFile: null,

        tran_at: this.ds.serverTimestamp(),
        tran_date_key: toDateKey(serverDateTime),
      }

      this.store?.saveManualPaid(item, movement, invoice).then(()=>{
        this.snackBar.open(`ប្រតិបត្តិការបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.process = false;
        this.dialogRef?.close()
      })

    })

  }


  async _onSaveManualNoChangeFolderNum(f){
    if(this.form?.invalid || this.process){
      this.form.markAllAsTouched()
      return
    }
    this.process = true
    await this.auth.getServerTime()
    const { selectedCriminal,selectedCitizenProfile } = this.data
    const { config,serverDateTime } = this.auth
    let selected_language = []
    const khmer_language_obj = {
      ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[0],
      amount: f?.khmer_amount,
    }
    selected_language.push(khmer_language_obj);
    if (f?.france_form) {
      const france_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[1],
        amount: f?.france_amount,
      }
      selected_language.push(france_language_obj);
    }
    if (f?.english_form) {
      const english_language_obj = {
        ...CRIMINAL_APPLICATION_LANGUAGE_ARRAY[2],
        amount: f?.english_amount,
      }
      selected_language.push(english_language_obj);
    }
    const { isStudent,nationality,urgent_obj,apply_from,application_country,application_embassy,paid_remark} = f;
    const withdraw_date = workingDay(this.holidays, serverDateTime, urgent_obj?.key || 20)

    const receivedBy = {
      key: "acleda",
      display_name: "ACLEDA",
      name: "ACLEDA",
      photoUrl: null,
    };

    let invoiceId = this.selectedInvoice?.invoice_id
    if(!invoiceId){
      invoiceId = await this.store?.getInvoiceNumber();
    }

    const invoice: any = {
      key: this.selectedInvoice?.key || this.ds.createId(),
      invoice_id: invoiceId,
      isDelete: false,
      created_at: this.selectedInvoice?.created_at?.toDate() || serverDateTime,
      created_by: this.selectedInvoice?.created_by || this.store?.getMappedProfile(),
      updated_at: this.ds.serverTimestamp(),
      date_key: toDateKey(serverDateTime),
      page_key: pageKey(),

      urgent_obj: urgent_obj,
      criminal_language: selected_language,
      apply_from: apply_from,
      isStudent: isStudent || false,
      national_application: nationality,
      bank_option: null,
      payment_option: mapToPaymentOption(this.selectedPaymentOption),
      total_amount: this.grandTotal,
      criminalRef: selectedCriminal?.key,

      status: STATUS_OBJ?.PAID,
      paid_at: this.ds.serverTimestamp(),
      paid_by: receivedBy,

      paid_online: true,
      paid_bank: receivedBy,
      paid_remark: paid_remark || null,
      paid_amount: this.grandTotal,
    }

    const item = {
      ...selectedCriminal,

      apply_at: selectedCriminal?.apply_at || this.auth.serverDateTime,
      apply_by: this.store.getMappedProfile(),

      isStudent: isStudent || false,
      national_application: nationality || null,
      criminal_language : selected_language,
      urgent_obj: urgent_obj || null,
      apply_from: apply_from || null,

      application_country: mapToCountryData(application_country),
      application_embassy: mapToEmbassyData(application_embassy),
      pay_option: MANUAL_PAID,
      selected_payment_option_key: this.selectedPaymentOption?.key || null,

      withdraw_date: withdraw_date,
      withdraw_date_key: toDateKey(withdraw_date),
      shift_name: config.criminal_working_hours?.afternoon_shift || null,

      folder_key_ref: null,

      tran_at: this.ds.serverTimestamp(),
      tran_date_key: toDateKey(serverDateTime),

      manual_paid_at: this.ds.serverTimestamp(),
      manual_paid_by: this.store.getMappedProfile(),

      paid_at: this.ds.serverTimestamp(),
      paid_by: this.store.getMappedProfile(),

      receipt_ref: invoice?.key,
      receipt_amount: this.grandTotal,

      paid_online: true,
      paid_bank: receivedBy,
      paid_remark: paid_remark || null,
      paid_amount: this.grandTotal ? toNumber(this.grandTotal) : null,
      payment_option: mapToPaymentOption(this.selectedPaymentOption)
    }

    const SYSTEM = {
      key: "system",
      display_name: "SYSTEM",
      name: "SYSTEM",
      photoUrl: null,
    };

    this.store?.saveManualPaidNoMoment(item, invoice).then(()=>{
      this.snackBar.open(`ប្រតិបត្តិការបានរក្សាទុកដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
      this.process = false;
      this.dialogRef?.close()
    })
  }
}


