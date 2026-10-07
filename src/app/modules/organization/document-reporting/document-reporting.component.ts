
import { Component, Inject, OnInit, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { searchStore } from 'src/app/stores/document/search.store';

@Component({
    selector: 'app-document-reporting',
    templateUrl: './document-reporting.component.html',
    styleUrls: ['./document-reporting.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentReportingComponent implements OnInit {
  form: UntypedFormGroup;
  filterOffice: Observable<any[]>;
  department: AbstractControl;
  constructor(
    private fb: UntypedFormBuilder,
    public store: searchStore,
    public ds: DatabaseService,
    @Inject(DOCUMENT) public document: Document,

  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      documentID: [],
      documentType: [],
      documentSource: [],
      department: [],
      isFilterDate: [false],
      fromDate: [{ value: null, disabled: true }],
      toDate: [{ value: null, disabled: true }],
    })
    this.department = this.form.controls['department'];

    await this.store.fetchCategory();
    await this.store.fetchDepartment(data => {
      // this.filterOffice = 
      this.filterOffice = MappingService.autoComplete(this.department, data, "name");

    });
    await this.store.fetchInstitution();
  }

  toggleChange(event) {
    const { checked } = event;
    if (checked) {
      this.form.controls['fromDate'].enable();
      this.form.controls['toDate'].enable();
      this.form.patchValue({
        fromDate: new Date(),
        toDate: new Date(),
      })
    } else {
      this.form.controls['fromDate'].disable();
      this.form.controls['toDate'].disable();
    }
  }

  onSearch(f) {
    this.store.fetchSearchData(f);
  }
}
