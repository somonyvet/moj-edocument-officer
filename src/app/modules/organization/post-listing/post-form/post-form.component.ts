import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IStockVisa } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, orderListFormat, toDepartmentNoWorkplace, toGeoData, toManagementLevel, toNameKey, toNumber, toUniq } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { BaseStore } from 'src/app/stores/base.store';

@Component({
    selector: 'app-post-form',
    templateUrl: './post-form.component.html',
    styleUrls: ['./post-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PostFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;

  title: any = "បង្កើតក្រុមផ្តល់ទិដ្ឋាការ";
  form: UntypedFormGroup;
  province: AbstractControl;
  subOfDepartment: AbstractControl;

  filterProvince: Observable<any[]>;
  filteredStockVisaOptions: Observable<IStockVisa[]>;

  constructor(
    public dialogRef: MatDialogRef<PostFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: BaseStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item as IStockVisa;
    this.form = this.fb.group({
      code: [item?.code || null, [Validators.required], this.checkExistRef.bind(this)],
      displayName: [null, Validators.required],
      name: [null, Validators.required],
      adminOffice: [false],
      province: [null, Validators.compose([MappingService.validSelected.bind(this)])],
      subOfDepartment: [null, Validators.compose([MappingService.validSelected.bind(this)])],
    })
    this.province = this.form.controls['province']
    this.subOfDepartment = this.form.controls['subOfDepartment']

    if (this.data?.item) {
      this.title = "កែប្រែក្រុមផ្តល់ទិដ្ឋាការ"
      const item = this.data.item as IStockVisa;
      const { code, displayName, name, adminOffice, province, subOfDepartment } = item;
      this.form.patchValue({
        code, displayName, name, adminOffice,
        province: province || null,
        subOfDepartment: subOfDepartment || null,
      })
    }

    const provinces = await this.store.fetchList(this.ds.provincesRef());
    this.filterProvince = MappingService.autoComplete(this.province, provinces, "name");

    const stockVisas = await this.store.fetchList(this.ds.stockVisaRef(ref => ref.orderBy("node")));
    this.filteredStockVisaOptions = MappingService.autoComplete(this.subOfDepartment, stockVisas, "name");
  }

  async checkExistRef(control: AbstractControl) {
    const { value } = control
    if (!value) return null;
    const item = this.data?.item as IStockVisa;
    if (item) {
      const { code } = item;
      if (code !== toNameKey(code)) {
        const doc = await this.ds.stockVisaRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
      return null;
    }
    else {
      const doc = await this.ds.stockVisaRef(ref => ref.where('isDelete', '==', false).where('code', '==', toNameKey(value))).get().toPromise();
      if (doc.empty) return null;
      return { nameAvailable: true }
    }
  }
  
  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const item = (this.data?.item as IStockVisa) || null;
      const { province, name, code, adminOffice, displayName } = f;
      const subOfDepartment = f?.subOfDepartment as IStockVisa;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      const key = item?.key || this.ds.createId();
      if (subOfDepartment && item?.subOfDepartment?.key !== subOfDepartment?.key) {
        const parentMemberItems = pushToArray(await this.ds.stockVisaRef(ref => ref.where('isDelete', '==', false).where("subOfDepartment.key", "==", subOfDepartment.key)).get().toPromise());
        const { level, node, path } = subOfDepartment;
        const totalChild = parentMemberItems.length;
        const lastChild = MappingService.orderByDesc(parentMemberItems, "index")
        if (totalChild === 0) {
          indexItem = (toNumber(totalChild) + 1);
        } else {
          const { index } = lastChild[0];
          indexItem = toNumber(index) + 1
        }
        nodeItem = `${node}${orderListFormat(indexItem)}.`
        levelItem = level + 1;
        parentItem = node;
        pathItem = toUniq((path || []).concat([subOfDepartment?.key]));
      } else {
        if (subOfDepartment) {
          pathItem = toUniq((subOfDepartment?.path || []).concat([subOfDepartment?.key]));
        } else if (item) {
          pathItem = item?.path;
        }
        if (!item) {
          const nodeRef = await this.ds.stockVisaRef(ref => ref.where('isDelete', '==', false)).get().toPromise();
          if (!nodeRef.empty) {
            const nodeData = pushToArray(nodeRef)[0];
            const { index } = nodeData;
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = pathItem
        }
      }
      const keywords = generateKeywords([name.toLowerCase()])
      keywords.push(`${code}`)
      if (subOfDepartment) {
        keywords.push(subOfDepartment.key)
      }
      const data: IStockVisa = {
        code: `${code}`.trim(),
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: keywords,
        name,
        displayName,
        province: toGeoData(province),
        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        path: pathItem,
        subOfDepartment: subOfDepartment ? toDepartmentNoWorkplace(subOfDepartment) : null,
        adminOffice: adminOffice || false,
      }

      this.store.addNew(this.ds.stockVisaRef(), data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Stock Visa has been saved successful.`, "Done", { duration: 1000 });
          this.form.reset();
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
