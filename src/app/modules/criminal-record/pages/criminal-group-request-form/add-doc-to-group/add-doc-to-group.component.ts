import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOC_CATEGORY_APP_ARRAY, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IOfficer, IPosition, IStockVisa } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy, pushObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, groupBy, MappingService, toCompany, toDepartment, toDepartmentNoWorkplace, toFlatten, toNameKey, toNumber, toRanking, toUniq } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { toJS } from 'mobx';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { BaseStore } from 'src/app/stores/base.store';
@Component({
    selector: 'app-add-doc-to-group',
    templateUrl: './add-doc-to-group.component.html',
    styleUrls: ['./add-doc-to-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddDocToGroupComponent implements OnInit, OnDestroy {

  titleForm: any = "បញ្ទូលឯកសារ";
  form: UntypedFormGroup;
  document: AbstractControl;

  filteredStockVisaOptions: Observable<IStockVisa[]>;

  constructor(
    public dialogRef: MatDialogRef<AddDocToGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: CriminalApplicationStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
    private baseStore: BaseStore
  ) { }
  documents = []
  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      document: [null, [Validators.required]],
    })
    this.document = this.form.controls['document'];
    this.documents = await this.baseStore.fetchList(this.ds.criminalRecordRef(ref => ref.orderBy("created_at")));
    this.filteredStockVisaOptions = MappingService.autoComplete(this.document, this.documents, "keyword");
  }

  ngOnDestroy() {
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { document } = f;
      const { selectedGroupDoc } = this.store;
      const { uid } = this.auth
      this.store.updateLinkGroupCriminalRecord(document, selectedGroupDoc, uid, (success, res) => {
        this.form.enable();
        if (success) {
          this.documents = this.documents.filter(m => m.key !== document.key)
          this.filteredStockVisaOptions = MappingService.autoComplete(this.document, this.documents, "keyword");
          this.snackBar.open(`Officer has been created successful.`, "Done", { duration: 3000 });
          this.form.reset();
          if (this.data.req || this.data.item) {
            this.dialogRef.close("close");
          }
        } else {
          alert(res);
        }
      })
    }
  }

  displayFullName(item: any): string {
    return item ? `${item.last_name} ${item.first_name}` : ''
  }

}
