import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IRanking } from 'src/app/interfaces/document/document.interface';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, toNameKey, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { RankingStore } from 'src/app/stores/document/ranking.store';
@Component({
    selector: 'app-ranking-form',
    templateUrl: './ranking-form.component.html',
    styleUrls: ['./ranking-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RankingFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតមុខងារតួនាទី";
  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<RankingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: RankingStore,
    private ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      name_en: [null],
      order: [null,[Validators.required],this.checkExistOrderRef.bind(this)],
      
    })
    if (this.data?.item) {
      this.title = "កែប្រែមុខងារតួនាទី"
      const item = this.data.item as IRanking;
      const { name, name_en, file,order } = item;
      this.form.patchValue({
        name, name_en,order
      })
    }
  }

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { nameKey } = item;
        if (nameKey !== toNameKey(value)) {
          const doc = await this.store.checkExist(toNameKey(value),'nameKey').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNameKey(value),"nameKey").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  async checkExistOrderRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { order } = item;
        if (order !== toNumber(value)) {
          const doc = await this.store.checkExist(toNumber(value),"order").get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNumber(value),"order").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, name_en,order } = f;
      const item: IRanking = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IRanking = {
        key: item?.key || this.ds.createId(),
        status: STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([f.name]),
        isDelete: item?.isDelete || false,
        //fields
        name: name,
        nameKey: toNameKey(name),
        name_en: name_en,
        displayName: name,
        file: item?.file || null,
        order:order,
      }
      
      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Management level has been saved successful.`, "Done", { duration: 3000 });
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
