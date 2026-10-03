import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router, ActivatedRoute } from '@angular/router';
import { toNumber } from 'lodash';
import { days, monthOfYear, periodData } from 'src/app/dummy/report';
import { toMonthKh, toYearOfPeriod, ConvertService, toMonthOfYear, toDayOfMonth, getDateReport } from 'src/app/shared/services/convert.service';

@Component({
  selector: 'app-report-filter-selected-month',
  templateUrl: './report-filter-selected-month.component.html',
  styleUrls: ['./report-filter-selected-month.component.scss']
})
export class ReportFilterSelectedMonthComponent implements OnInit {
  @Input() reportType: any;
  @Input() reportRoute: any;
  @Input() fromDate: any;
  @Input() periodType: number;
  @Output() onPress = new EventEmitter();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  periodData = periodData;
  periodOption = new FormControl(periodData[6], Validators.required);
  dayOfPeriod = new FormControl(20, Validators.required);
  monthOfPeriod = new FormControl(toMonthKh(new Date()), Validators.required);
  yearOfPeriod = new FormControl(toYearOfPeriod(new Date()), Validators.required);

  days = days;
  months = monthOfYear;
  years = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (this.fromDate) {
      this.fromDate = ConvertService.numberToDate(this.fromDate);
    } else {

      const formDateNumber = ConvertService.dateKey();
      const toDateNumber = ConvertService.dateKey();
      this.fromDate = ConvertService.numberToDate(formDateNumber);
    }

    this.periodOption.patchValue(periodData.filter(m => m.key == this.periodType)[0])
    for (let index = 2000; index < 2050; index++) { this.years.push(`${index}`) }
    const selectedMonth = this.months.filter(m => m.key === toMonthOfYear(this.fromDate))[0];
    const selectedYear = this.years.filter(m => m === toYearOfPeriod(this.fromDate))[0];
    this.dayOfPeriod.patchValue(this.days.filter(m => m.key === toDayOfMonth(this.fromDate))[0])
    this.monthOfPeriod.patchValue(selectedMonth)
    this.yearOfPeriod.patchValue(selectedYear)
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
    const fromDate = toNumber(`${this.yearOfPeriod.value}${this.monthOfPeriod.value.key}`);
    if (this.reportRoute) {
      this.router.navigate([this.reportRoute], {
        queryParams:
        {
          fromdate: fromDate,
          todate: null,
          postKey: sparams.postKey ? sparams.postKey : null,
          travelKey: sparams.travelKey ? sparams.travelKey : null,
        }
      });
    }

  }
}
