import { HrAttendanceStore } from './../../stores/hr-attendance.store';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { KHMER_MONTH_ARRAY } from 'src/app/dummy/report';
import { ConvertService, toLocaleNumber } from 'src/app/shared/services/convert.service';

@Component({
  selector: 'app-human-resource-attendances',
  templateUrl: './human-resource-attendances.component.html',
  styleUrls: ['./human-resource-attendances.component.scss']
})
export class HumanResourceAttendancesComponent implements OnInit {
  daysInMonth = 0;
  daysArr = [];
  startDateKey = '';
  endDateKey = '';
  title = "បញ្ជីវត្តមានមន្ត្រីប្រចាំខែ";

  constructor(
    public store: HrAttendanceStore
  ) { }


  async ngOnInit(): Promise<void> {
    let dt = new Date();
    let month = dt.getMonth();
    let year = dt.getFullYear();

    this.title += KHMER_MONTH_ARRAY[month];
    this.daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= this.daysInMonth; day++) {
      this.daysArr.push(toLocaleNumber(day));
    }
    this.startDateKey = ConvertService.toDateKey(new Date(year, month, 1)).toString();
    this.endDateKey = ConvertService.toDateKey(new Date(year, month, this.daysArr.length)).toString();

    await this.store.fetchHrAttendances(this.startDateKey, this.endDateKey);
    setTimeout(() => this.resizeSecondTable(), 600);

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeSecondTable();
  }


  resizeSecondTable() {
    let firstTableView = document.getElementById('firstTable');
    let secondTableView = document.getElementById('secondTable');
    let thirdTableView = document.getElementById('thirdTable');
    let tableWrapperView = document.getElementById('tableWrapper');

    if (!firstTableView || !thirdTableView) return;

    let ftWidth = firstTableView?.clientWidth;
    let ttWidth = thirdTableView?.clientWidth;
    let wrapperWidth = tableWrapperView?.clientWidth;

    secondTableView.style.marginLeft = ftWidth + 1 + 'px';
    secondTableView.style.marginRight = ttWidth + 1 + 'px';

    secondTableView.style.overflowX = 'scroll';
    let result = wrapperWidth - 60 - ftWidth - ftWidth;
    secondTableView.style.width = result + 'px';
  }


  fetchMore(event) {
    this.store.fetchMoreHrAttendances(this.startDateKey, this.endDateKey);
  }




}
