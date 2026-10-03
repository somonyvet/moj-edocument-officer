import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { ICategory, IDepartment, IDocument, IHeaderInformation, IInstitution } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushObjArray, pushStringArray, sum } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { addDays, generateKeywords, MappingService, toCapitalize, toCompany, toDateFromTimePickerData, toDepartmentNoWorkplace, toNameKey, toTimePickerData, toUniq, toUserAccount, toWorkplaceAssistant, toWorkplaceKeys } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { map, take, debounceTime } from "rxjs/operators";
import { Router } from '@angular/router';
import { ACCOUNT_PERMISSION_OBJECT, DOCUMENT_TYPE_OBJECT, PRIORITY_OBJECT } from 'src/app/dummy/config';
import { DataService } from 'src/app/shared/services/data.service';
import { docStatusObj, DOC_CATEGORY_OBJ } from 'src/app/dummy/status';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "ឯកសារឌីជីថល";

  form: FormGroup;
  hashtagItems: string[] = [];
  organizationRef: AbstractControl;
  filteredOrganizationOptions: Observable<IInstitution[]>;
  category: AbstractControl;
  filteredCategoryOptions: Observable<ICategory[]>;

  process: boolean = false;
  loading: boolean = true;

  workplaceOptions: any[] = [];
  workplaceAssistantOptions: any[] = [];
  workplaceList: IDepartment[] = []

  parentDocument: IHeaderInformation = null;
  constructor(
    public dialogRef: MatDialogRef<DocumentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    public ds: DatabaseService,
    public storage: FireStorageService,
    private router: Router,
    public db: DataService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    const item = this.data?.item as IHeaderInformation;
    this.parentDocument = this.data?.headerDocument || null;
    const { currentDepartment, employee } = this.auth;
    this.store.documentAccounts = [];
    this.store.documentWorkplaces = [];
    this.store.documentAssistantAccounts = [];
    let deadlineDate = addDays(new Date(), 3)
    this.hashtagItems = this.parentDocument?.hashtag || []
    this.form = this.fb.group({
      refNo: [null],
      organizationRef: [null, [MappingService.validSelected.bind(this)]],
      category: [null, [MappingService.validSelected.bind(this)]],
      duration: [null, [Validators.required]],
      name: [null, [Validators.required]],
      documentNo: [null, [Validators.required], this.checkExistRef()],
      hashtag: [null],
      deadline: [deadlineDate, [Validators.required]],
      workplaces: [[], [Validators.required]],
      workplaceAssistants: [null],
      receivedDate: [deadlineDate, [Validators.required]],
      receiveTimePicker: [toTimePickerData(deadlineDate)]
    })
    this.organizationRef = this.form.controls['organizationRef']
    this.category = this.form.controls['category']

    this.workplaceOptions = currentDepartment?.workplace?.filter(m => m?.allowUsed) || [];
    const institutions = await this.store.fetchInstitutionsDocument()
    const categories = await this.store.fetchCategoriesDocument()
    this.filteredOrganizationOptions = MappingService.autoComplete(this.organizationRef, institutions, 'name')
    this.filteredCategoryOptions = MappingService.autoComplete(this.category, categories, 'name')

    if (item) {
      const { doc_parent, receivedDate, receiveTime, doc_status, final, documentTitle, documentNo, hashtag, deadline, workplaces, refNo, organizationRef, duration, workplaceAssistants, category } = item;
      await this.store.fetchSelectedDocumentAccount(item);
      this.parentDocument = await this.store.fetchDocument(doc_parent || null) || null;

      this.hashtagItems = hashtag || [];
      this.form.patchValue({
        name: documentTitle,
        documentNo: documentNo,
        deadline: deadline ? deadline?.toDate() : deadlineDate,
        workplaces: workplaces?.filter(m => m?.isActive) || [],
        refNo, organizationRef, duration,
        workplaceAssistants: workplaceAssistants || [],
        category,
        receivedDate: receivedDate ? receivedDate?.toDate() : deadlineDate,
        receiveTimePicker: receiveTime ? toTimePickerData(receiveTime?.toDate()) : toTimePickerData(deadlineDate),
      })
      this.workplaceList = workplaces;
      this.workplaceOptions = workplaces?.filter(m => m?.allowUsed) || [];

      this.getAssistantList()
      this.store.documentWorkplaces = workplaces;
      if (final || doc_status?.key === docStatusObj?.void?.key) {
        this.form.disable();
      } else if (doc_status?.key !== docStatusObj.hold?.key) {
        this.form.controls['workplaceAssistants'].disable()
        this.form.controls['workplaces'].disable()
      }
    } else {
      this.workplaceList = await this.store.fetchWorkplaceDocument(currentDepartment?.workplace?.map(m => m?.key));
      await this.store.fetchDocumentAccount(this.workplaceList, this.workplaceOptions, employee, currentDepartment)
      this.getAssistantList()
      await this.store.fetchAssistantOfficer(this.workplaceAssistantOptions)
      const { documentWorkplaces } = this.store;
      const totalDays = sum(documentWorkplaces?.filter(m => m?.allowUsed), "completedDuration")
      deadlineDate = addDays(new Date(), totalDays || 3)
      this.form.patchValue({
        workplaces: this.store.documentWorkplaces,
        workplaceAssistants: this.workplaceAssistantOptions || [],
        duration: totalDays || 3,
        deadline: deadlineDate,
        category: this.parentDocument?.category || null,
        refNo: this.parentDocument?.refNo || null,
        organizationRef: this.parentDocument?.organizationRef || null,
        name: this.parentDocument?.documentTitle || null,
      })
    }
    this.loading = false;
  }

  getAssistantList() {
    const { managementLevels } = this.auth;
    this.workplaceAssistantOptions = this.workplaceList?.filter(m => {
      const level = managementLevels?.find(l => l?.key === m?.ranking?.key);
      if (level && m?.verifyFromAssistant && level?.positionAssistant?.length > 0) {
        return m;
      }
    }).map(m => {
      const level = managementLevels?.find(l => l?.key === m?.ranking?.key);
      const txt = level?.positionAssistant?.map(x => x.name).join(",");
      return { ...m, displayNameAssistant: txt, positionAssistantKeys: level?.positionAssistant?.map(i => i?.key) }
    })
  }

  ngOnDestroy() {
    this.store.documentAccounts = [];
    this.store.documentWorkplaces = [];
    this.store.documentAssistantAccounts = [];
  }


  onSelectedWorkplace(event) {
    const { selected, value } = event?.option;
    const { documentWorkplaces, documentAccounts, documentAssistantAccounts } = this.store;
    const findWorkplace = documentWorkplaces.find(m => m?.key === value?.key)
    if (findWorkplace) {
      this.store.documentWorkplaces = pushObjArray(documentWorkplaces, {
        ...findWorkplace,
        isActive: selected,
        showInHeader: selected,
      })
      const items = documentAccounts?.map(m => {
        if (m?.workplaceKey === value?.key && m?.key !== this.data?.item?.created_by) {
          return { ...m, isActive: selected, showInHeader: selected, }
        }
        return m;
      })
      this.store.documentAccounts = items;
    }
    //assistant option
    const activeWorkplacesKey = this.store.documentWorkplaces?.filter(m => m?.isActive).map(m => m?.key);
    const items = this.workplaceAssistantOptions?.filter(m => activeWorkplacesKey.includes(m?.key))
    this.form.patchValue({
      workplaceAssistants: items
    })
    this.store.documentAssistantAccounts = documentAssistantAccounts.map(m => {
      const isActive = activeWorkplacesKey.includes(m?.workplaceKey);
      return { ...m, isActive };
    })
  }

  onSelectedAssistant(event) {
    const { selected, value } = event?.option;
    const { documentAssistantAccounts } = this.store;
    this.store.documentAssistantAccounts = documentAssistantAccounts.map(m => {
      if (m?.workplaceKey === value?.key) {
        return { ...m, permission: selected ? ACCOUNT_PERMISSION_OBJECT.canConfirm : ACCOUNT_PERMISSION_OBJECT.readOnly }
      }
      return m;
    })
  }


  removeTag(tag: string) {
    this.hashtagItems = this.hashtagItems.filter(m => m !== tag.trim())
  }

  addTag(tag: string) {
    const find = this.hashtagItems.find(m => m === tag.trim())
    if (!find) {
      this.hashtagItems.push(tag.trim())
      this.form.controls['hashtag'].reset()
    }
  }

  checkExistRef() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      if (value) {
        return this.ds.headerDocumentRef(ref => ref.where('isDelete', '==', false).where('documentNoKey', '==', toNameKey(value)))
          .get()
          .pipe(
            debounceTime(300),
            take(1),
            map((arr) => {
              const item = this.data?.item as IHeaderInformation;
              if (item?.documentNoKey === toNameKey(value)) {
                return null;
              }
              const val = arr.size > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      } else {
        return null;
      }
    };
  }


  async _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable();
      this.process = true;
      const item: IHeaderInformation = this.data?.item || null;
      let document: IDocument = null;
      if (item) {
        document = await this.store.fetchDocumentOfHeader(item.key);
      }
      const { refNo, organizationRef, category, duration, name, documentNo, deadline, workplaceAssistants, receivedDate, receiveTimePicker } = f;
      const key = item?.key || this.ds.createId();
      const { uid, currentDepartment, selectedCompany, employee } = this.auth;
      const { documentWorkplaces, documentAccounts, documentAssistantAccounts, } = this.store;

      let keywords = generateKeywords([documentNo, name]);
      if (this.hashtagItems && this.hashtagItems.length > 0) {
        keywords = keywords.concat(this.hashtagItems.map(r => (`${r}`.trim().toLocaleUpperCase())))
      }
      if (refNo) {
        keywords = keywords.concat([toCapitalize(refNo)])
      }
      if (organizationRef) {
        keywords = keywords.concat([organizationRef?.key])
      }
      if (category) {
        keywords = keywords.concat([category?.key])
      }
      if (documentWorkplaces && documentWorkplaces.length > 0) {
        keywords = keywords.concat(documentWorkplaces?.map(m => m?.key))
      }
      if (this.parentDocument) {
        keywords = keywords.concat([this.parentDocument?.documentNo, this.parentDocument.refNo, this.parentDocument.key])
      }
      const assistantAccountsItems = documentAssistantAccounts?.filter(m => m?.isActive);
      const documentAccountsItems = documentAccounts?.filter(m => m?.isActive);
      const assistantAccounts = assistantAccountsItems?.filter(m => m?.permission?.key !== ACCOUNT_PERMISSION_OBJECT?.readOnly?.key)
      const assistantReadOnlyAccounts = assistantAccountsItems?.filter(m => m?.permission?.key === ACCOUNT_PERMISSION_OBJECT?.readOnly?.key)
      const approvedByKeys = documentAccountsItems?.map(m => m?.key).concat(assistantAccounts?.map(m => m?.key));
      const peopleKeys = documentAccountsItems?.map(m => m.key).concat(assistantAccountsItems?.map(m => m?.key))
      const receivedTime = toDateFromTimePickerData(receivedDate, receiveTimePicker);

      const { headerDoc, isMoreReport } = this.data
      let addMoreItem = null
      if (isMoreReport) {
        let isHeader = false
        let headerRef = null
        if (!headerDoc?.more_report_isHeader && !headerDoc?.more_report_headerRef) {
          isHeader = true
          headerRef = headerDoc.key
        }
        if (headerDoc?.more_report_headerRef) {
          isHeader = false
          headerRef = headerDoc?.more_report_headerRef
        }

        addMoreItem = {
          isMoreReport: isMoreReport ? isMoreReport : false,
          more_report_isHeader: isHeader,
          more_report_headerRef: headerRef,

          doc_type: DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO,
          doc_parent: headerRef,
        }
      }

      const headerData: IHeaderInformation = {
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        owner_profile: item?.owner_profile || toUserAccount(employee),
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        isDelete: item?.isDelete ?? false,
        keyword: toUniq(keywords),
        documentType: item?.documentType ?? null,
        //send cc and bcc
        documentTitle: name,
        documentNo: documentNo,
        documentNoKey: toNameKey(documentNo),
        hashtag: this.hashtagItems ?? [],
        priority: item?.priority ?? PRIORITY_OBJECT.NORMAL,
        documentKey: item?.documentKey ?? null,
        doc_parent: item?.doc_parent || this.parentDocument?.key || null,
        doc_parentData: item?.doc_parentData || this.parentDocument?.doc_parentData.concat([key]) || [key],
        doc_status: item?.doc_status ?? docStatusObj.hold,
        doc_status_level: item?.doc_status_level || currentDepartment?.ranking,
        duration: duration || null,
        refNo: refNo || null,
        organizationRef: organizationRef ? toCompany(organizationRef) : null,
        category: category ? toCompany(category) : null,

        workplaceAssistants: workplaceAssistants?.map(m => ({ ...toWorkplaceAssistant(m) })) || [],
        workplaces: documentWorkplaces,
        workplaceKeys: documentWorkplaces?.filter(m => m?.isActive)?.map(m => m?.key),
        workplace: item?.workplace || toDepartmentNoWorkplace(currentDepartment),
        workplacePath: toWorkplaceKeys(currentDepartment?.workplacePath),
        //org chart
        company: selectedCompany ? toCompany(selectedCompany) : null,
        receivedWorkplace: item?.receivedWorkplace || [],
        receivedWorkplaceKeys: item?.receivedWorkplaceKeys || [],
        approvedByKeys: approvedByKeys || [],
        readOnlyKeys: item?.readOnlyKeys?.length > 0 ? item?.readOnlyKeys : assistantReadOnlyAccounts?.map(m => m?.key),
        completedByKeys: item?.completedByKeys || [],

        accountKeys: item?.accountKeys || peopleKeys,
        peopleKeys: peopleKeys,
        final: item?.final || false,
        files: item?.files || [],
        deadline: deadline,
        deadlineKey: ConvertService.toDateKey(deadline),
        completedWorkplaceKeys: item?.completedWorkplaceKeys || [],
        receivedWorkplaceCompletedByDocKeys: item?.receivedWorkplaceCompletedByDocKeys || [],
        doc_type: this.parentDocument ? DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO : DOCUMENT_TYPE_OBJECT.MEMO,
        receiveTime: receivedTime,
        receiveTimePicker: receiveTimePicker,
        receivedDate: receivedDate,

        document_category: DOC_CATEGORY_OBJ.edoc,

        ...addMoreItem,
        more_report_isHeader: false
      }

      const data: IDocument = {
        key: key,
        status: document ? (document.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: document?.created_at || this.ds.serverTimestamp(),
        created_by: document?.created_by || this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: document?.page_key || ConvertService.pageKey(),
        isDelete: false,
        keyword: toUniq(keywords),
        name: name,
        displayName: name,
        documentNo: documentNo,
        title: document?.title || `<p style="text-align:center;" data-placeholder="បញ្ចូលចំណងជើង....."><span style="font-family:'khmer os muol light', khmer_os_muol_light;"><u>កំណត់បង្ហាញ</u></span></p>`,
        files: document?.files ?? null,
        objective: document?.objective ?? null,
        reference: document?.reference ?? null,
        description: document?.description ?? null,
        header: document ? document.header : [],
        footer: document ? document.footer : [],
        headerInformationRef: document?.headerInformationRef || null,
        doc_parent: document?.doc_parent || null,

        document_category: DOC_CATEGORY_OBJ.edoc
      }

      this.store.addDocument(data, headerData, documentAccountsItems, [], this.parentDocument, addMoreItem, (success, res) => {
        this.form.enable();
        this.process = false;
        if (success) {
          this.snackBar.open(`Document has been saved successful.`, "Done", {
            duration: 1000,
            verticalPosition: 'bottom',
            horizontalPosition: 'end',
          });
          this.form.reset();
          this.inputRef.nativeElement.focus();
          if (this.data.req || this.data.item) {
            this.dialogRef.close(data);
          } else {
            const url = this.router.url;
            this.router.navigate([`/edoc/form/${headerData?.key}/${headerData?.workplace?.key}/design`], { queryParams: { backUrl: JSON.stringify(url) } })
            this.dialogRef.close(data)
          }
        } else {
          alert(res)
        }
      })
    }
  }

}
