import { MmeProgramStore } from './../../../../stores/document/mme-program.store';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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

@Component({
    selector: 'app-year-program-form',
    templateUrl: './year-program-form.component.html',
    styleUrls: ['./year-program-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class YearProgramFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតឆ្នាំសម្រាប់កម្មវិធី";
  form: UntypedFormGroup;
  officer: AbstractControl;
  filteredOptionsOfficer: any;

  constructor(
    public dialogRef: MatDialogRef<YearProgramFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: MmeProgramStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required])],
      year: [null, [Validators.required]]
    })
    this.officer = this.form.controls['officer']

    if (this.data?.item) {
      this.title = "កែប្រែឆ្នាំសម្រាប់កម្មវិធី"
      const item = this.data.item as IYearProgram;
      const { name, year } = item;
      this.form.patchValue({
        name,
        year
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
      const data: IYearProgram = {
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
        year: year.toString(),
        yearKey: getYear(year),

      }

      this.store.saveYear(data, (success, res) => {
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
