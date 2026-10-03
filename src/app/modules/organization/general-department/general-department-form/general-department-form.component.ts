import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEPARTMENT_STATUS_OBJ, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IDepartment, IManagementLevel, IPosition, IRanking } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushObjArray, pushToArray } from 'src/app/shared/services/convert.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, orderListFormat, toCompany, toManagementLevel, toNameKey, toRanking, toWorkplace } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GeneralDepartmentStore } from 'src/app/stores/document/general-department.store';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { toJS } from 'mobx';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ICompany } from 'src/app/interfaces/user';

@Component({
  selector: 'app-general-department-form',
  templateUrl: './general-department-form.component.html',
  styleUrls: ['./general-department-form.component.scss']
})
export class GeneralDepartmentFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតស្ថាប័នគ្រប់គ្រង";
  form: FormGroup;
  ranking: AbstractControl;
  filteredRankingOptions: Observable<IRanking[]>;

  SELECTED_PHOTO: any = null;
  START_UPLOAD: boolean = false;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;

  constructor(
    public dialogRef: MatDialogRef<GeneralDepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: GeneralDepartmentStore,
    public ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.store.position = []
    this.store.positionCarbonCopy = []
    const { config } = this.auth;

    if (this.data?.item) {
      this.title = "កែប្រែស្ថាប័នគ្រប់គ្រង"
    }
    this.form = this.fb.group({
      name: [null, [Validators.required], this.checkExistRef.bind(this)],
      name_en: [null],
      displayName: [null, [Validators.required]],
      ranking: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      completedDuration: [null, [Validators.required]],
    })
    this.ranking = this.form.controls['ranking'];

    const items = await this.store.fetchRanking()
    this.filteredRankingOptions = MappingService.autoComplete(this.ranking, items.filter(m => m.order === config?.general_department_order), 'name')
    if (this.data?.item) {
      const item = this.data.item as IDepartment;
      const { name, name_en, file, displayName, ranking, completedDuration } = item;
      const management = items.find(m => m?.key === ranking?.key) as IManagementLevel;
      this.store.position = management?.positionManager || [];
      this.form.patchValue({
        name, name_en, displayName,
        ranking: management,
        completedDuration: completedDuration || null,
      })
      this.URL = file?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
    }
  }

  optionSelectedManagement(event: MatAutocompleteSelectedEvent) {
    const { value } = event.option;
    this.store.position = value?.positionManager || [];
  }

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { name } = item;
        if (name !== value) {
          const doc = await this.store.checkExist(toNameKey(value)).get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNameKey(value)).get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }


  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_PHOTO = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.URL = event.target.result;
      }
      this.photoFile.nativeElement.value = "";
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const item = this.data?.item as IDepartment;
      const { name, name_en, displayName, ranking, completedDuration } = f;
      const { config } = this.auth;
      const selectedCompany = (this.auth?.selectedCompany || null) as any;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`;
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = selectedCompany ? [selectedCompany.key] : [];
      if (!item) {
        const nodeRef = await this.ds.departmentFireRef(ref => ref.where('ranking.key', '==', config?.startFromLevel?.key).where('isDelete', '==', false)).get().toPromise();
        if (!nodeRef.empty) {
          const nodeData = pushToArray(nodeRef)[0];
          const { index } = nodeData;
          indexItem = index + 1;
          nodeItem = `${orderListFormat(indexItem)}.`
        }
      }
      else {
        indexItem = item?.index;
        nodeItem = item?.node;
        levelItem = item?.level;
        parentItem = item?.parent
      }
      const keywords = generateKeywords([name.toLowerCase()])
      const key = item?.key || this.ds.createId();
      let workplace = [
        { key, name_en: name_en || null, name, order: levelItem, subOfDepartment: null, index: indexItem, node: nodeItem, managementLevel: toManagementLevel(ranking) }
      ]
      const data: IDepartment = {
        code: displayName,
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: keywords,
        name: name,
        name_en: name_en,
        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        path: pathItem,
        workplace: workplace,
        file: item ? item.file : null,
        nameKey: toNameKey(name),
        displayName: displayName,
        subOfDepartment: null,
        company: selectedCompany ? toCompany(selectedCompany) : null,
        headerOfficer: item?.headerOfficer || [],
        headerOfficerKeys: item?.headerOfficerKeys || [],
        ranking: toManagementLevel(ranking),
        adminOffice: false,
        completedDuration: completedDuration || null,
      }
      if (this.SELECTED_PHOTO) {
        const files = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = files[0]
      }
      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Top management has been created successful.`, "Done", { duration: 1000 });
          this.form.reset();
          this.store.position = [];
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          }
        } else {
          alert(res)
        }
      })
    }
  }

}
