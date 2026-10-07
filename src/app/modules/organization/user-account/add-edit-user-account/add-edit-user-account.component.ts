import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOC_CATEGORY_APP_ARRAY, PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IOfficer, IPosition, IStockVisa } from 'src/app/interfaces/document/document.interface';
import { ConvertService, orderBy, pushObjArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, groupBy, MappingService, toCompany, toDepartment, toFlatten, toNameKey, toNumber, toRanking, toUniq } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OfficerOfficeFormComponent } from '../officer-office-form/officer-office-form.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
@Component({
    selector: 'app-add-edit-user-account',
    templateUrl: './add-edit-user-account.component.html',
    styleUrls: ['./add-edit-user-account.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddEditUserAccountComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('photoFile') photoFile: ElementRef;
  @ViewChild('signatureFile') signatureFile: ElementRef;
  @ViewChild('remarkFile') remarkFile: ElementRef;
  @ViewChild('stampFile') stampFile: ElementRef;

  titleForm: any = "បង្កើតមន្ត្រីបុគ្គលិក";
  form: UntypedFormGroup;

  title: AbstractControl;
  stock_visa: AbstractControl;
  filterTitle: Observable<IPosition[]>;
  filteredStockVisaOptions: Observable<IStockVisa[]>;

  SELECTED_PHOTO: any = null;
  SELECTED_STAMP: any = null;
  SELECTED_SIGNATURE: any = null;
  SELECTED_REMARK: any = null;
  START_UPLOAD: boolean = false;
  URL: any = PHOTO_LIB.EMPTY_PHOTO;
  REMARK_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  SIGNATURE_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  STAMP_URL: any = PHOTO_LIB.EMPTY_PHOTO;
  DOC_CATEGORY_APP_ARRAY=DOC_CATEGORY_APP_ARRAY;

  constructor(
    public dialogRef: MatDialogRef<AddEditUserAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: OfficerStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    console.log("this.data",this.data)
    this.store.workingOffices = [];
    this.store.position = [];
    this.form = this.fb.group({
      officerId: [null, [Validators.required], this.checkExistRef.bind(this)],
      first_name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      first_name_en: [null, [Validators.required]],
      last_name_en: [null, [Validators.required]],
      title: [null, [MappingService.validSelected.bind(this)]],
      currentTitle: [null, [Validators.required]],
      currentPosition: [null],
      phoneNumber: [null, [Validators.required], this.checkExistPhonNumberRef.bind(this)],
      stock_visa: [null, Validators.compose([MappingService.validSelected.bind(this)])],
      defaultApp: [null, [Validators.required]]

    })
    this.title = this.form.controls['title'];
    this.stock_visa = this.form.controls['stock_visa'];

    const positions = await this.store.fetchPosition();
    this.filterTitle = MappingService.autoComplete(this.title, positions, "name");

    const stockVisas = await this.store.fetchList(this.ds.stockVisaRef(ref => ref.orderBy("node")));
    this.filteredStockVisaOptions = MappingService.autoComplete(this.stock_visa, stockVisas, "name");

    if (this.data?.item) {

      console.log('this.data?.item?.key',this.data?.item?.key)

      this.titleForm = "កែប្រែមន្ត្រីបុគ្គលិក"
      const item = this.data.item as IOfficer;
      const {defaultApp, isAdmin, phoneNumber, officerId, first_name, last_name, first_name_en, last_name_en, file, title, workingOffices, signatureFile, remarkFile, stampFile, currentTitle, currentPosition, stock_visa } = item;
      if (isAdmin) {
        this.form.controls['officerId'].disable()
      } else {
        this.form.controls['officerId'].enable()
      }
      this.store.position = title;
      this.store.workingOffices = workingOffices;
      this.form.patchValue({
        officerId,
        first_name,
        last_name,
        last_name_en,
        first_name_en,
        currentTitle,
        currentPosition: currentPosition || null,
        phoneNumber,
        stock_visa: stock_visa || null,
        defaultApp:defaultApp||null
      })
      this.URL = file?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
      this.REMARK_URL = remarkFile?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
      this.SIGNATURE_URL = signatureFile?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
      this.STAMP_URL = stampFile?.downloadUrl || PHOTO_LIB.EMPTY_PHOTO;
    }
    console.log(this.data?.item)
  }

  ngOnDestroy() {
    this.store.workingOffices = [];
    this.store.position = [];
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(OfficerOfficeFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: true,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item?.office?.name, item: item, },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        const { workingOffices } = this.store;
        this.store.workingOffices = workingOffices.filter(m => m?.key !== item.key)
      }
    })
  }

  optionSelectedPosition(event) {
    const { value } = event.option;
    const { position } = this.store;
    this.store.position = pushObjArray(position, value)
    this.title.reset()
  }

  drop(event: CdkDragDrop<IPosition[]>) {
    moveItemInArray(this.store.position, event.previousIndex, event.currentIndex);
  }

  removePosition(item: IPosition) {
    const { position } = this.store;
    this.store.position = position.filter(m => m.key !== item.key)
  }

  async checkExistPhonNumberRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { phoneNumber } = item;
        if (phoneNumber !== value) {
          const doc = await this.store.checkOfficeExist(`0${toNumber(`${value}`.trim())}`, 'phoneNumber').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkOfficeExist(`0${toNumber(`${value}`.trim())}`, "phoneNumber").get().toPromise();
        if (doc.empty) return null;
        return { nameAvailable: true }
      }
    }
  }

  async checkExistRef(control: AbstractControl) {
    if (control) {
      const { item } = this.data;
      const { value } = control
      if (!value) return null;
      if (item) {
        const { nameKey } = item;
        if (nameKey !== value) {
          const doc = await this.store.checkOfficeExist(`${value}`, 'nameKey').get().toPromise();
          if (doc.empty) return null;
          return { nameAvailable: true }
        }
        return null;
      }
      else {
        const doc = await this.store.checkOfficeExist(`${value}`, "nameKey").get().toPromise();
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

  onSelectedRemarkFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_REMARK = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.REMARK_URL = event.target.result;
      }
      this.remarkFile.nativeElement.value = "";
    }
  }

  onSelectedSignatureFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_SIGNATURE = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.SIGNATURE_URL = event.target.result;
      }
      this.signatureFile.nativeElement.value = "";
    }
  }


  onSelectedStampFile(event) {
    if (event && event.target.files.length > 0) {
      this.SELECTED_STAMP = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.STAMP_URL = event.target.result;
      }
      this.stampFile.nativeElement.value = "";
    }
  }


  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      const { last_name_en, first_name, last_name, first_name_en, currentTitle, currentPosition, phoneNumber, stock_visa,defaultApp } = f;
      const item: IOfficer = (this.data && this.data.item) || null;
      const officerId = f?.officerId || item?.officerId;
      const { uid, selectedCompany } = this.auth;
      const { position } = this.store;
      const workingOffices = orderBy(this.store.workingOffices, "office.ranking.order")
      const fullName = `${last_name} ${first_name}`
      const fullNameEn = `${last_name_en} ${first_name_en}`
      const positions = groupBy(toFlatten(workingOffices.map(m => m.position)), "key")

      const offices = toUniq(toFlatten(workingOffices.map(m => m.office?.workplace?.map(d => d?.key))));

      const workplaceOfOfficer = groupBy(toFlatten(workingOffices.map(m => m.office)), "key");

      let officeItems: any[] = []
      workingOffices.map(m => {
        const items = m?.office?.workplace;
        if (Array.isArray(items)) officeItems.push(items[items.length - 1])
      })

      const workplaces = orderBy(groupBy(officeItems, "key"), "order") as any[];
      const currentWorkplace = workplaceOfOfficer?.length > 0 ? workplaceOfOfficer[0] : null;
      const data: IOfficer = {
        key: item?.key || this.ds.createId(),
        status: item?.status || STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: item?.date_key || ConvertService.dateKey(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: generateKeywords([`${officerId}`, ConvertService.toCapitalize(fullName), ConvertService.toCapitalize(fullNameEn)]),
        isDelete: item?.isDelete || false,
        //fields
        phoneNumber: `0${toNumber(`${phoneNumber}`.trim())}`,
        officerIdNo: toNumber(`${officerId}`.trim()),
        currentTitle,
        currentPosition: currentPosition || null,
        officerId: officerId,
        first_name: ConvertService.toCapitalize(first_name),
        last_name: ConvertService.toCapitalize(last_name),
        nameKey: toNameKey(officerId),
        last_name_en: ConvertService.toCapitalize(last_name_en),
        first_name_en: ConvertService.toCapitalize(first_name_en),
        displayName: `${ConvertService.toCapitalize(last_name)} ${ConvertService.toCapitalize(first_name)}`,
        file: item?.file ?? null,
        workingOffices,
        title: position.length > 0 ? position.map(m => ({ ...toRanking(m) })) : [],

        positions: positions,
        positionKeys: positions?.length > 0 ? positions.map(m => m?.key) : [],
        position: positions?.length > 0 ? positions[0] : null,
        positionWorkplaceKeys: workingOffices.map(m => (`${m?.office?.key}_${m?.position?.key}`)),
        officeKeys: offices?.length > 0 ? offices : [],
        workplace: workplaces || [],
        workplaceKeys: workplaces.map(m => m?.key) || [],
        currentDepartment: currentWorkplace,
        workplaceKey: currentWorkplace?.key || null,
        company: selectedCompany ? toCompany(selectedCompany) : null,

        isAdmin: item?.isAdmin || false,
        stampFile: item?.stampFile ?? null,
        remarkFile: item?.remarkFile ?? null,
        signatureFile: item?.signatureFile ?? null,

        defaultApp:defaultApp || null,
        stock_visa: stock_visa ? toDepartment(stock_visa) : null,
      }
      if (this.SELECTED_PHOTO) {
        if (data?.file) {
          await this.storage.deleteFile(data.stampFile);
        }
        const file = await this.storage.upload([this.SELECTED_PHOTO])
        data.file = file[0]
      }

      if (this.SELECTED_REMARK) {
        if (data?.remarkFile) {
          await this.storage.deleteFile(data.remarkFile);
        }
        const file = await this.storage.upload([this.SELECTED_REMARK])
        data.remarkFile = file[0]
      }

      if (this.SELECTED_SIGNATURE) {
        if (data?.signatureFile) {
          await this.storage.deleteFile(data.signatureFile);
        }
        const file = await this.storage.upload([this.SELECTED_SIGNATURE])
        data.signatureFile = file[0]
      }
      if (this.SELECTED_STAMP) {
        if (data?.stampFile) {
          await this.storage.deleteFile(data.stampFile);
        }
        const file = await this.storage.upload([this.SELECTED_STAMP])
        data.stampFile = file[0]
      }
      await this.store.save(data, (success, res) => {
        this.form.enable();
        if (success) {
          this.snackBar.open(`Officer has been created successful.`, "Done", { duration: 3000 });
          this.form.reset();
          this.store.workingOffices = []
          this.store.position = []
          this.SELECTED_PHOTO = null;
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

  displayItem(item: any): string {
    return item ? item.displayName : ''
  }

  displayItemDepartment(item: any): string {
    return item ? item.name : ''
  }
}


const officerKeys = [
  'P1zkl12DzbetmgXefINV',
  'nXtOOeAIh5b86L7Q0xZQ',
  'XSMEQTA4ZD15gwXaIvEd',
  'adgHDzEeP7JaxvwEvqpt',
  'Qy7ln5n6RjQUPtnIzul3',
]

const translateOfficers = [
  'Qy7ln5n6RjQUPtnIzul3',
]

const incrementPrintPaidOnline = 0;