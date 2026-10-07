import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { STATUS_OBJ } from 'functions/src/services/data';
import { AnimationOptions } from 'ngx-lottie';
import { PHOTO_LIB,CRIMINAL_APPLICATION_LANGUAGE_OBJECT } from 'src/app/dummy/appinfo';
import { tabs } from 'src/app/dummy/tabs';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { PositionStore } from 'src/app/stores/document/position.store';
import { CriminalApplicationStore } from '../../stores/criminalApplication.store';
import { CriminalLetterPrintByLanguageComponent } from '../../components/criminal-letter-print-by-language/criminal-letter-print-by-language.component';

@Component({
    selector: 'app-criminal-group-request-form-listing-template-display-all',
    templateUrl: './criminal-group-request-form-listing-template-display-all.component.html',
    styleUrls: ['./criminal-group-request-form-listing-template-display-all.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalGroupRequestFormListingTemplateDisplayAllComponent implements OnInit {
  tabs = tabs.officers;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  formFocus: boolean;
  isAdmin = false
  form: UntypedFormGroup
  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };
  printDate = new Date();

  ARRAY = Array;

  CRIMINAL_APPLICATION_LANGUAGE = CRIMINAL_APPLICATION_LANGUAGE_OBJECT;

  loading = true;

  constructor(
    public store: CriminalApplicationStore,
    public criminalStore: CriminalApplicationStore,
    private route: ActivatedRoute,
    public auth: AuthStore,
    private ps: PrintService,
    public pa: PositionStore,
    public dialog: MatDialog,
  ) { }

  criminalRecords = []
  criminalGroupService = null
  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.loading = true;
      this.store.fetchData(params?.id, res => {
        this.criminalRecords = res;
        const criminalGroupServiceData = MappingService.groupBy(this.criminalRecords, 'urgent_obj.key', 'urgent_obj.key')
        this.criminalGroupService = criminalGroupServiceData && criminalGroupServiceData.length > 0 ? criminalGroupServiceData[0] : null
        this.loading = false;
      });
    })
  }

  openDialogPrint(items,lang){
    const dialogRef = this.dialog.open(CriminalLetterPrintByLanguageComponent, {
      data: { criminalRecords: items,lang:lang },
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
  }


  ngOnDestroy() {
    this.store.subscribeData()
  }

}
