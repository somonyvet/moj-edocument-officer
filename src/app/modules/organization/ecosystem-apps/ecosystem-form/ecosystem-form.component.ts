import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { DOC_CATEGORY_APP_ARRAY, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IEcosystem, IManagementLevel } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushToArray, toUniq } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, orderListFormat, toNameKey, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { EcosystemStore } from 'src/app/stores/document/ecosystem.store';

@Component({
    selector: 'app-ecosystem-form',
    templateUrl: './ecosystem-form.component.html',
    styleUrls: ['./ecosystem-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EcosystemFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតកម្រិតគ្រប់គ្រង";
  form: UntypedFormGroup;
  SELECTED_PHOTO: any = null;
  START_UPLOAD: boolean = false;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  DOC_CATEGORY_APP_ARRAY = DOC_CATEGORY_APP_ARRAY;

  subOfWorkplace: AbstractControl;
  filterSubOfWorkplace: Observable<IManagementLevel[]>;

  constructor(
    public dialogRef: MatDialogRef<EcosystemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: EcosystemStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private db: DatabaseService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required]), this.checkExistRef.bind(this)],
      name_en: [null],
      subOfWorkplace: [null, [MappingService.validSelected.bind(this)]],
      icon_app: [null, [Validators.required]],
      icon_web: [null, [Validators.required]],
      route_app: [null, [Validators.required]],
      route_web: [null, [Validators.required]],
      app_no: [null, [Validators.required]],
      isDefault: [null],
      isPrimary: [null],
      defaultApp: [null, [Validators.required]]
    })
    this.subOfWorkplace = this.form.controls['subOfWorkplace'];
   
    if (this.data?.item) {
      this.title = "កែប្រែកម្រិតគ្រប់គ្រង"
      const item = this.data.item as IEcosystem;
      const { name, name_en, icon_app, icon_web, route_app, route_web, app_no, isDefault, isPrimary, defaultApp } = item;

      this.form.patchValue({
        name, name_en, app_no, icon_app, icon_web, route_app, route_web, isDefault, isPrimary, defaultApp
      })
    }
    this.store.fetchItems(items => {
      this.filterSubOfWorkplace = MappingService.autoComplete(this.subOfWorkplace, items, 'name')
      if (this.data?.item) {
        this.form.patchValue({
          subOfWorkplace: items.find(m => m?.key === this.data?.item?.subOfWorkplace?.key)
        })
      }
    })
  }

  ngOnDestroy() {
    const { fetchManagementLevelsRef } = this.store;
    fetchManagementLevelsRef && fetchManagementLevelsRef.unsubscribe()
  }

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { nameKey } = item;
        if (nameKey !== toNameKey(value)) {
          const doc = await this.store.checkExist(toNameKey(value), 'nameKey').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNameKey(value), "nameKey").get().toPromise();
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
          const doc = await this.store.checkExist(toNumber(value), "order").get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkExist(toNumber(value), "order").get().toPromise();
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
      const { name, name_en, subOfWorkplace, icon_app, icon_web, route_app, route_web, app_no, isDefault, isPrimary, defaultApp } = f;
      const item: IManagementLevel = (this.data && this.data.item) || null;
      const { uid } = this.auth;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      if (subOfWorkplace && item?.subOfWorkplace?.key !== subOfWorkplace?.key) {
        const parentMemberItems = pushToArray(await this.db.ecosystemFireRef(ref => ref.where('isDelete', '==', false).where("subOfWorkplace.key", "==", subOfWorkplace.key)).get().toPromise());
        const { level, node, path } = subOfWorkplace;
        const lastChild = MappingService.orderByDesc(parentMemberItems, "index")
        const totalChild = parentMemberItems.length;
        if (totalChild === 0) {
          indexItem = (toNumber(totalChild) + 1);
        } else {
          const { index } = lastChild[0];
          indexItem = toNumber(index) + 1
        }
        nodeItem = `${node}${orderListFormat(indexItem)}.`
        levelItem = level + 1;
        parentItem = node;
        pathItem = toUniq((path || []).concat(subOfWorkplace.path).concat([subOfWorkplace?.key]));
      } else {
        if (!item) {
          const nodeRef = await this.db.ecosystemFireRef(ref => ref.where('isDelete', '==', false)).get().toPromise();
          if (!nodeRef.empty) {
            const nodeData = pushToArray(nodeRef)[0];
            const { index } = nodeData;
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
          } else {
            indexItem = 1;
            nodeItem = `${orderListFormat(indexItem)}.`
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = item?.parent
        }
      }
      const parentDepartment = subOfWorkplace ? { key: subOfWorkplace.key, name: subOfWorkplace?.name } : null;

      const data: IEcosystem = {
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
        icon_app, icon_web, route_app, route_web, app_no,

        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        subOfWorkplace: parentDepartment || null,
        path: pathItem,
        file: item?.file || null,
        isDefault: isDefault || false,
        isPrimary: isPrimary || false,
        defaultApp: defaultApp || null,
        defaultAppKey:defaultApp?.map(m=>`${m?.key}`),
      }
      if (this.SELECTED_PHOTO) {
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = file[0]
      }
      this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`App has been saved successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.inputRef.nativeElement.focus();
          this.SELECTED_PHOTO = null;
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
