import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { days, KHMER_DAY, monthOfYear, monthOfYearEng } from 'src/app/dummy/report';
import { khmerNumberToEN, toLocaleNumber } from '../../services/convert.service';
import { DataService } from '../../services/data.service';
import { getYearsList, MappingService } from '../../services/mapping.service';

@Component({
  selector: 'app-khmer-date-form-picker',
  templateUrl: './khmer-date-form-picker.component.html',
  styleUrls: ['./khmer-date-form-picker.component.scss']
})
export class KhmerDateFormPickerComponent implements OnInit, OnChanges {
  @Input() isKhmer: boolean;
  @Input() day: any;
  @Input() month: any;
  @Input() year: any;
  @Input() class: string;
  @Input() label: string;
  @Input() title: any;
  @Input() disabled: boolean
  @Input() international: boolean;
  @Input() required: boolean;
  @Input() forceKH: boolean;

  @Output() onSelectedItem = new EventEmitter()

  daysKhmerNumber = KHMER_DAY;

  khmerMonthsArray = monthOfYear;

  years = getYearsList(200);

  dayCtr: AbstractControl;
  filteredDay: Observable<any[]>;

  monthCtr: AbstractControl;
  filteredMonth: Observable<any[]>;

  yearCtr: AbstractControl;
  filteredYear: Observable<any[]>;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ds: DataService,
  ) { }

  ngOnInit(): void {

    if(this.forceKH){
      this.day = {
        ...this.day,
        isKhmer : true,
      }
      this.month = {
        ...this.month,
        isKhmer : true,
      }
      this.year = {
        ...this.year,
        isKhmer : true,
      }
    }

    this.form = this.fb.group({
      day: [this.day || null, [this.required ? Validators.required : Validators.nullValidator, MappingService.validSelected.bind(this)]],
      month: [this.month || null, [this.required ? Validators.required : Validators.nullValidator, MappingService.validSelected.bind(this)]],
      year: [this.year || null, [this.required ? Validators.required : Validators.nullValidator, MappingService.validSelected.bind(this)]]
    })

    this.dayCtr = this.form.controls['day'];
    this.monthCtr = this.form.controls['month'];
    this.yearCtr = this.form.controls['year'];

    this.dayCtr.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(value => {
      if (typeof value === 'object') {
        this.onSelectedItem.emit({
          day: this.form.get('day').value,
          month: this.form.get('month').value,
          year: this.form.get('year').value,
        })
      } else {
        this.onSelectedItem.emit({
          day: null,
          month: this.form.get('month').value,
          year: this.form.get('year').value,
        })
      }
    })

    this.monthCtr.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(value => {
      if (typeof value === 'object') {
        this.onSelectedItem.emit({
          day: this.form.get('day').value,
          month: this.form.get('month').value,
          year: this.form.get('year').value,
        })
      } else {
        this.onSelectedItem.emit({
          day: this.form.get('day').value,
          month: null,
          year: this.form.get('year').value,
        })
      }
    })

    this.yearCtr.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(value => {
      if (typeof value === 'object') {
        this.onSelectedItem.emit({
          day: this.form.get('day').value,
          month: this.form.get('month').value,
          year: this.form.get('year').value,
        })
      } else {
        this.onSelectedItem.emit({
          day: this.form.get('day').value,
          month: this.form.get('month').value,
          year: null,
        })
      }
    })
    this.daysKhmerNumber = KHMER_DAY?.map(m => ({ ...m, isKhmer: this.isKhmer }))
    this.khmerMonthsArray = monthOfYear?.map(m => ({ ...m, isKhmer: this.isKhmer }))
    const years = getYearsList(200).map(m => { return { key: `${m}`, name: toLocaleNumber(m, 4), isKhmer: this.isKhmer, name_en: `${m}` } })

    this.filteredDay = this.autoComplete(this.dayCtr, this.daysKhmerNumber, 'number')
    this.filteredMonth = this.autoComplete(this.monthCtr, this.khmerMonthsArray, 'name')
    this.filteredYear = this.autoComplete(this.yearCtr, years, 'number')

    if (this.international) {

      this.daysKhmerNumber = days;
      this.khmerMonthsArray = monthOfYearEng;
      const yearEng = getYearsList(200).map(m => { return { key: m.toString(), name: m?.toString(), name_en: `${m}` } });

      this.filteredDay = this.autoComplete(this.dayCtr, this.daysKhmerNumber, 'number')
      this.filteredMonth = this.autoComplete(this.monthCtr, this.khmerMonthsArray, 'name')
      this.filteredYear = this.autoComplete(this.yearCtr, yearEng, 'number')
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.day) {
      this.form?.get('day')?.patchValue(changes?.day?.currentValue);
    }
    if (changes?.month) {
      this.form?.get('month')?.patchValue(changes?.month?.currentValue);
    }
    if (changes?.year) {
      this.form?.get('year')?.patchValue(changes?.year?.currentValue);
    }
    if (changes?.disabled) {
      changes?.disabled?.currentValue ? this.form?.disable() : this.form?.enable();
    }
  }

  optionSelected() {
    this.onSelectedItem.emit({
      day: this.form.get('day').value,
      month: this.form.get('month').value,
      year: this.form.get('year').value,
    })
  }

  autoComplete(stateCtrl: AbstractControl, data: any, type): Observable<any> {
    return stateCtrl.valueChanges.pipe(startWith(''),
      map(state => state ? this.filterStates(data, stateCtrl?.value?.name ? stateCtrl?.value?.name : stateCtrl?.value, type) : data.slice())
    );
  }

  filterStates(data: any[], value: any, type: string): any[] {
    if (!value || value?.key || value?.id) return data;
    const field = this.isKhmer ? 'name' : 'name_en';
    if (type === 'number') {
      if (parseInt(value))
        //case user input EN number
        return data.filter(state => state[field]?.toLowerCase().indexOf(toLocaleNumber(parseInt(value), value?.length)?.toLowerCase()) > -1);
      else
        // case user input Khmer number
        return data.filter(state => state[field]?.toLowerCase().indexOf(value?.toLowerCase()) > -1);
    }
    else {
      return data.filter(state => state[field]?.toLowerCase().indexOf(value?.toLowerCase()) > -1);
    }
  }


  displayNameAndNameEn(item: any): any {
    return item ? (!item?.isKhmer? item?.name_en : item?.name) : null;
  }
}
