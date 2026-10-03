import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AchievementStatusStore } from 'src/app/modules/mme/store/achievementStatus.store';
import { IAchievementStatus } from 'src/app/modules/mme/interfaces/document.interface';
@Component({
  selector: 'app-achievement-status-form',
  templateUrl: './achievement-status-form.component.html',
  styleUrls: ['./achievement-status-form.component.scss']
})
export class AchievementStatusFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;

  title: any = "បង្កើតផ្ទៀងផ្ទាត់សមិទ្ធិផល";
  form: FormGroup;
  filteredOptionsOfficer: any;
  filterSourceBudget: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AchievementStatusFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: AchievementStatusStore,
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
      name_kh: [null, Validators.compose([Validators.required])],
      order: [null, Validators.compose([Validators.required])],
      description: [null],
    })
    if (this.data?.item) {
      this.title = "កែប្រែផ្ទៀងផ្ទាត់សមិទ្ធិផល"
      const item = this.data.item as IAchievementStatus;
      const { name, color, name_kh, order, description } = item;
      this.form.patchValue({
        color, name_kh, order, description, name
      })
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { name, color, name_kh, order, description } = f;
      const item: IAchievementStatus = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      const data: IAchievementStatus = {
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
        color, name_kh, order, name,
        description: description || null,
      }

      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Achievement status has been saved successful.`, "Done", { duration: 3000 });
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
