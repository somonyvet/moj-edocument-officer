import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, take, map } from 'rxjs/operators';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { days, monthOfYear } from 'src/app/dummy/report';
import { IPosition } from 'src/app/interfaces/document/document.interface';
import { addDay, ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, getYearsList, toCodeKey, todayDate, toNameKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PositionStore } from 'src/app/stores/document/position.store';
import { CitizenStore } from '../../stores/citizen.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';

@Component({
    selector: 'app-criminal-letter-add-receive-no',
    templateUrl: './criminal-letter-add-receive-no.component.html',
    styleUrls: ['./criminal-letter-add-receive-no.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalLetterAddReceiveNoComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "ចុះលេខព្រឹត្តិបត្រ";
  form: UntypedFormGroup;

  isKhmerForm: boolean = false;
  selectedCitizenProfile;

  constructor(
    public dialogRef: MatDialogRef<CriminalLetterAddReceiveNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    public store: CitizenStore,
    public criminalStore: CriminalApplicationStore,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      can_received_at: [new Date(), [Validators.required]],
      code_kh: [null, [Validators.required], this.checkExistCodeKhRef.bind(this)],
      // code_en: [null, [Validators.required], this.checkExistCodeEnRef()],
      // code_fr: [null, [Validators.required], this.checkExistCodeFrRef()],
    })

    if (this.data?.item) {
      this.title = "ចុះលេខព្រឹត្តិបត្រ"
      const item = this.data.item;
      const { code_kh, code_en, code_fr } = item;
      this.form.patchValue({
        code_kh, code_en, code_fr
      })
    }

    const { item } = this.data
    this.selectedCitizenProfile = await this.store.fetchDoc(this.ds.dbRef().collection("citizens").doc(item.citizen_ref))
  }

  async checkExistCodeKhRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { code_kh_key } = item;
        if (code_kh_key !== value) {
          const doc = await this.criminalStore.checkDocNoExist(toCodeKey(value), 'code_kh_key').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.criminalStore.checkDocNoExist(toCodeKey(value), "code_kh_key").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  // checkExistCodeKhRef() {
  //   return (control: AbstractControl) => {

  //     const value = control?.value || null;
  //     if (value !== null && value !== "" && value !== undefined) {

  //       const { item } = this.data;
  //       if (item) {

  //         if (item.code_kh_key !== value) {
  //           return this.ds.criminalRecordRef(ref => ref.where('code_kh_key', '==', toCodeKey(value))).get()
  //             .pipe(
  //               debounceTime(300),
  //               take(1),
  //               map(arr => {
  //                 const val = arr.size > 0 ? { nameAvailable: true } : null;
  //                 return val;
  //               })
  //             );
  //         }else return null;

  //       } else {
  //         return this.ds.criminalRecordRef(ref => ref.where('code_kh_key', '==', toCodeKey(value))).get()
  //           .pipe(
  //             debounceTime(300),
  //             take(1),
  //             map(arr => {
  //               const val = arr.size > 0 ? { nameAvailable: true } : null;
  //               return val;
  //             })
  //           );
  //       }
  //     }
  //   };
  // }

  checkExistCodeEnRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.criminalRecordRef(ref => ref.where('code_en_key', '==', toCodeKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  checkExistCodeFrRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.criminalRecordRef(ref => ref.where('code_fr_key', '==', toCodeKey(value))).get()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { config } = this.auth
      const { period_can_receive_day } = config
      const { item, criminalRecords, selectedGroupDoc } = this.data
      const { code_kh, code_en, code_fr, can_received_at } = f;
      const DAYS = days?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
      const MONTHS = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmerForm }))
      const years = getYearsList(100).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmerForm, name_en: `${m}` } })
      const date = todayDate(this.auth.serverDateTime, DAYS, MONTHS, years);

      const isLastRecode = criminalRecords.filter(m => m.key !== item.key && m.status && m.status.key === STATUS_OBJ.APPROVED.key).length === 0 ? true : false

      const canReceivedExpiredAtPlus = addDay(can_received_at, period_can_receive_day)

      const totalD = ConvertService.calcCRDays(can_received_at, canReceivedExpiredAtPlus.toDate())
      const canReceivedExpiredAt = addDay(can_received_at, totalD)

      const keyword = (item?.keyword || [])
      const form = {
        ...item,
        updated_by: this.criminalStore?.getMappedProfile(),
        updated_at: this.ds.serverTimestamp(),

        can_received_at: can_received_at,
        can_received_expired_at: canReceivedExpiredAt.toDate(),
        can_received_by: this.criminalStore?.getMappedProfile(),
        status: STATUS_OBJ.RECEIVED,
        keyword: keyword,
        code_kh: code_kh.trim(),
        code_kh_key: toCodeKey(code_kh),

        // code_en: code_en.trim(),
        // code_en_key: toCodeKey(code_en),
        // code_fr: code_fr.trim(),
        // code_fr_key: toCodeKey(code_fr),
        // expired_date: ConvertService.addMonth(3),
      }

      this.criminalStore.approvedCriminalInputNumber(form, this.selectedCitizenProfile, true, isLastRecode, selectedGroupDoc).then(() => {
        this.snackBar.open(`ប្រតិបត្តិការជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.dialogRef.close()
      })

    }
  }

}
