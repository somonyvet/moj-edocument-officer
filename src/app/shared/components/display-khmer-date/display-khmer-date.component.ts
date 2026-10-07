import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { days, KHMER_DAY, monthOfYear, monthOfYearEng } from 'src/app/dummy/report';
import { khmerNumberToEN, toLocaleNumber } from '../../services/convert.service';
import { DataService } from '../../services/data.service';
import { getYearsList, MappingService } from '../../services/mapping.service';

@Component({
    selector: 'app-display-khmer-date',
    templateUrl: './display-khmer-date.component.html',
    styleUrls: ['./display-khmer-date.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DisplayKhmerDateComponent implements OnInit {
  @Input() isKhmer: boolean = true;
  @Input() day: any = null;
  @Input() month: any = null;
  @Input() year: any = null;
  @Input() class: string = null;
  @Input() label: string = null;
  @Input() title: any = null;
  @Input() disabled: boolean = false;
  @Input() international: boolean = false;


  @Output() onSelectedItem = new EventEmitter()

  daysKhmerNumber = KHMER_DAY;

  khmerMonthsArray = monthOfYear;

  years = getYearsList(100);

  dayCtr: AbstractControl;
  filteredDay: Observable<any[]>;

  monthCtr: AbstractControl;
  filteredMonth: Observable<any[]>;

  yearCtr: AbstractControl;
  filteredYear: Observable<any[]>;

  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      day: [this.day || null, [MappingService.validSelected.bind(this)]],
      month: [this.month || null, [MappingService.validSelected.bind(this)]],
      year: [this.year || null, [MappingService.validSelected.bind(this)]]
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

    const years = this.years.map(m => { return { key: m.toString(), name: toLocaleNumber(m, 4) } })

    this.filteredDay = this.autoComplete(this.dayCtr, this.daysKhmerNumber, 'number')
    this.filteredMonth = this.autoComplete(this.monthCtr, this.khmerMonthsArray, 'name')
    this.filteredYear = this.autoComplete(this.yearCtr, years, 'number')

    if (this.international) {

      this.daysKhmerNumber = days;
      this.khmerMonthsArray = monthOfYearEng;
      const yearEng = getYearsList(100).map(m => { return { key: m.toString(), name: m?.toString() } });

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
    if (value.key || value.id || !data) {
      return data.filter(state => state?.key === value?.key);
    }
    if (type === 'number') {
      if (parseInt(value))
        //case user input EN number
        return data.filter(state => state?.name?.toLowerCase().indexOf(toLocaleNumber(parseInt(value), value?.length)?.toLowerCase()) > -1);
      else
        // case user input Khmer number
        return data.filter(state => state?.name?.toLowerCase().indexOf(value?.toLowerCase()) > -1);
    }
    else {
      return data.filter(state => state?.name?.toLowerCase().indexOf(value.toLowerCase()) > -1);
    }
  }
}
