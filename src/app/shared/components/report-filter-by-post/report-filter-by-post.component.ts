import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-report-filter-by-post',
  templateUrl: './report-filter-by-post.component.html',
  styleUrls: ['./report-filter-by-post.component.scss']
})
export class ReportFilterByPostComponent implements OnInit {
  @Input() selectedInspection: any;
  @Output() onPress = new EventEmitter();

  inspection = new FormControl();

  constructor(
    // public store: Geo,
  ) { }

  inspectionList = [
    {key: 1, name: '01'},
    {key: 2, name: '02'},
    {key: 3, name: '03'},
  ];
  async ngOnInit() {
    // const data = await this.store.fetchInspection()
    // const { envData, inspectionsData } = data;
    // this.inspectionList = inspectionsData;

    if (this.selectedInspection) {
      this.inspection.patchValue(this.selectedInspection)
    } else {
      this.inspection.patchValue(null)
    }
  }

  compareWith(o1: any, o2: any) {
    if (o1 && o2) return o1.key === o2.key;
    return false;
  }

  _onPress(filterAll) {
    const inspection = this.inspection.value ? this.inspection.value : null;
    this.onPress.emit({ filterAll: filterAll, inspection: inspection });
  }
}
