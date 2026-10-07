import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { PlaningCategoryStore } from 'src/app/modules/mme/store/planingCategory.store';
import { IPlaningCategory } from 'src/app/modules/mme/interfaces/document.interface';

@Component({
    selector: 'app-planing-level-form',
    templateUrl: './planing-level-form.component.html',
    styleUrls: ['./planing-level-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlaningLevelFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតកម្រិតគោលនយោបាយ";
  form: UntypedFormGroup;
  filteredOptionsOfficer: any;
  filterSourceBudget: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PlaningLevelFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: PlaningCategoryStore,
    private ds: DataService,
    private db: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required])],
      color: [null, Validators.compose([Validators.required])],
      backgroundColor: [null, Validators.compose([Validators.required])],
      order: [null, Validators.compose([Validators.required])],
      icon: [null, Validators.compose([Validators.required])],
      allowDoReport: [null],
      indicator: [null],
      remark: [null],
    })
    if (this.data?.item) {
      this.title = "កែប្រែកម្រិតគោលនយោបាយ"
      const item = this.data.item as IPlaningCategory;
      const { name, color, backgroundColor, order, icon, allowDoReport, indicator, remark } = item;
      this.form.patchValue({
        color, backgroundColor, order, icon, name, allowDoReport, indicator, remark
      })
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { color, backgroundColor, order, icon, name, allowDoReport, indicator, remark } = f;
      const item: IPlaningCategory = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IPlaningCategory = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([name]),
        isDelete: item?.isDelete || false,
        //fields
        color, backgroundColor, order, icon, name, allowDoReport: allowDoReport || false,
        indicator: indicator || false,
        remark: remark || false,
      }

      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Year for Program has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res);
        }
      })
    }
  }

}
