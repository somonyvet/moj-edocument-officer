import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router, ActivatedRoute } from '@angular/router';
import { toNumber } from 'lodash';
import { days, monthOfYear, periodData } from 'src/app/dummy/report';
import { toMonthKh, toYearOfPeriod, ConvertService, toMonthOfYear, toDayOfMonth, getDateReport } from 'src/app/shared/services/convert.service';

@Component({
    selector: 'app-report-filter-period',
    templateUrl: './report-filter-period.component.html',
    styleUrls: ['./report-filter-period.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ReportFilterPeriodComponent implements OnInit {
  @Input() reportType: any;
  @Input() reportRoute: any;
  @Input() fromDate: any;
  @Input() toDate: any;
  @Input() periodType: number;
  @Output() onPress = new EventEmitter();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  periodData = periodData;
  periodOption = new UntypedFormControl(periodData[6], Validators.required);
  dayOfPeriod = new UntypedFormControl(20, Validators.required);
  monthOfPeriod = new UntypedFormControl(toMonthKh(new Date()), Validators.required);
  yearOfPeriod = new UntypedFormControl(toYearOfPeriod(new Date()), Validators.required);
  toDayOfPeriod = new UntypedFormControl(20, Validators.required);
  toMonthOfPeriod = new UntypedFormControl(toMonthKh(new Date()), Validators.required);
  toYearOfPeriod = new UntypedFormControl(toYearOfPeriod(new Date()), Validators.required);

  days = days;
  months = monthOfYear;
  years = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private overlayContainer: OverlayContainer,
  ) { }

  ngOnInit() {
    if (this.fromDate && this.toDate) {
      this.fromDate = ConvertService.numberToDate(this.fromDate);
      this.toDate = ConvertService.numberToDate(this.toDate);
    } else {
      // const formDateNumber = ConvertService.getDateOfYearNew().form_date;
      // const toDateNumber = ConvertService.getDateOfYearNew().to_date;

      const formDateNumber = ConvertService.dateKey();
      const toDateNumber = ConvertService.dateKey();
      this.fromDate = ConvertService.numberToDate(formDateNumber);
      this.toDate = ConvertService.numberToDate(toDateNumber);
    }

    this.periodOption.patchValue(periodData.filter(m => m.key == this.periodType)[0])
    for (let index = 2000; index < 2050; index++) { this.years.push(`${index}`) }
    const selectedMonth = this.months.filter(m => m.key === toMonthOfYear(this.fromDate))[0];
    const selectedYear = this.years.filter(m => m === toYearOfPeriod(this.fromDate))[0];
    this.dayOfPeriod.patchValue(this.days.filter(m => m.key === toDayOfMonth(this.fromDate))[0])
    this.monthOfPeriod.patchValue(selectedMonth)
    this.yearOfPeriod.patchValue(selectedYear)
    const toSelectedMonth = this.months.filter(m => m.key === toMonthOfYear(this.toDate))[0];
    const toSelectedYear = this.years.filter(m => m === toYearOfPeriod(this.toDate))[0];
    this.toDayOfPeriod.patchValue(this.days.filter(m => m.key === toDayOfMonth(this.toDate))[0])
    this.toMonthOfPeriod.patchValue(toSelectedMonth)
    this.toYearOfPeriod.patchValue(toSelectedYear)
  }

  compareWith(o1: any, o2: any) {
    if (o1 && o2) return o1.key === o2.key;
    return false;
  }

  compareWithYear(o1: any, o2: any) {
    if (o1 && o2) return o1 === o2;
    return false;
  }

  changePeriod(event) {
    const { value } = event;

  }

  _onPress(filterAll) {
    const { value } = this.periodOption;
    const sparams = this.route.snapshot.queryParams
    const fromDate = toNumber(`${this.yearOfPeriod.value}${this.monthOfPeriod.value.key}${this.dayOfPeriod.value.key}`);
    const toDate = toNumber(`${this.toYearOfPeriod.value}${this.toMonthOfPeriod.value.key}${this.toDayOfPeriod.value.key}`);
    if (this.reportRoute){
      this.router.navigate([this.reportRoute], {
        queryParams:
        {
          fromdate: fromDate,
          todate: toDate,
          postKey: sparams.postKey ? sparams.postKey : null,
          travelKey: sparams.travelKey ? sparams.travelKey : null,
        }
      });
    }

  }

}
