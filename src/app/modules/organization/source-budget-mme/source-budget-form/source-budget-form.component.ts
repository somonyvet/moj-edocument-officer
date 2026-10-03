import { MmeProgramStore } from './../../../../stores/document/mme-program.store';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IPosition, IRemarkOfficer, IYearProgram } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, toNameKey, toOfficer, getYear } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { RemarkStore } from 'src/app/stores/document/remark.store';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Component({
  selector: 'app-source-budget-form',
  templateUrl: './source-budget-form.component.html',
  styleUrls: ['./source-budget-form.component.scss']
})
export class SourceBudgetFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតប្រភពថវិការ";
  form: FormGroup;
  filteredOptionsOfficer: any;
  filterSourceBudget: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SourceBudgetFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: MmeProgramStore,
    private ds: DataService,
    private db: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required])],
    })
    if (this.data?.item) {
      this.title = "កែប្រែប្រភពថវិការ"
      const item = this.data.item as IYearProgram;
      const { name, year } = item;
      this.form.patchValue({
        name,
      })
    }
  }

  displayFn(user: any): string {
    return user ? `${user?.last_name} ${user?.first_name}` : '';
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, year } = f;
      const item: IPosition = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: any = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: [],
        isDelete: item?.isDelete || false,
        //fields
        name: name,
        checked: false
      }

      this.store.save(this.db.mmeSourceBudgetRef(), data, (success, res) => {
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
