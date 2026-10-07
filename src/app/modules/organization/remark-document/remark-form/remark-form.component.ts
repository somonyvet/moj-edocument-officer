import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IPosition, IRemarkOfficer } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, toNameKey, toOfficer } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { RemarkStore } from 'src/app/stores/document/remark.store';

@Component({
    selector: 'app-remark-form',
    templateUrl: './remark-form.component.html',
    styleUrls: ['./remark-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RemarkFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតចំណារឯកភាព";
  form: UntypedFormGroup;
  remarkText: AbstractControl;
  filteredOptionsOfficer: any;

  constructor(
    public dialogRef: MatDialogRef<RemarkFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: OfficerStore,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      remarkText: [null, Validators.compose([Validators.required])],
    })
    this.remarkText = this.form.controls['remarkText']
    // const managementLevel = await this.store.fetchOfficers()
    // this.filteredOptionsOfficer = MappingService.autoComplete(this.officer, managementLevel, 'name')
    if (this.data?.item) {
      this.title = "កែប្រែចំណារឯកភាព"
      const item = this.data.item as IRemarkOfficer;
      const { remarkText } = item;
      this.form.patchValue({
        remarkText
      })
    }
  }

  displayFn(user: any): string {
    return user?`${user?.last_name} ${user?.first_name}` : '';
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, officer, remarkText } = f;
      const item: IPosition = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IRemarkOfficer = {
        key: item?.key || this.ds.createId(),
        created_at: item?.created_at || new Date,
        remarkText
      }
      // this.store.save(data, (success, res) => {
      //   this.form.enable();
      //   if (success) {
      //     this.snackBar.open(`Remark has been saved successful.`, "Done", { duration: 3000 });
      //     this.form.reset();
      //     this.inputRef.nativeElement.focus();
      //     if (this.data.req || this.data.item) {
      //       this.dialogRef.close(data);
      //     }
      //   } else {
      //     alert(res);
      //   }
      // })
      this.store.saveRemark(this.ds.remarkTextRef().doc(uid).collection('remarkTexts'), data, (success, error) => {
        if (success) {
          this.snackBar.open(`ចំណារបានបង្កើតដោយជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
          this.form.reset();
          this.dialogRef.close({ text: "yes", form: data });
        } else {
          this.snackBar.open(error, "យល់ព្រម");
        }
      })
    }
  }

}
