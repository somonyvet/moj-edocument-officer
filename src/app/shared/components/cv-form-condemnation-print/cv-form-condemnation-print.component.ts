import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { STATUS_LIVES_ARRAY } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { CriminalApplicationStore } from '../../../modules/criminal-record/stores/criminalApplication.store';

@Component({
  selector: 'app-cv-form-condemnation-print',
  templateUrl: './cv-form-condemnation-print.component.html',
  styleUrls: ['./cv-form-condemnation-print.component.scss']
})
export class CvFormCondemnationPrintComponent implements OnInit, OnDestroy {
  STATUS_LIVES_ARRAY_DATA = STATUS_LIVES_ARRAY;

  @ViewChild('photoFile') photoFile: ElementRef;
  ITEM: any;

  isKhmerForm : boolean = false

  constructor(
    private fb: FormBuilder,
    public ds: DataService,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public store: OfficerStore,
    public storage: FireStorageService,
    private ps: PrintService,
    public criminalStore: CriminalApplicationStore,
  ) { }

  ngOnInit() {
    const { selectedCitizenProfile } = this.criminalStore;
    this.ITEM = selectedCitizenProfile;
    this.isKhmerForm = selectedCitizenProfile?.national_application?.key === 'khmer';
  }

  ngOnDestroy() {
    this.store.unsubscribe();
    // this.criminalStore.unsubscribe();
  }

  onPrint() {
    this.ps.print("#print", "a4")
  }
}
