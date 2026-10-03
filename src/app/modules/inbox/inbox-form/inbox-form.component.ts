import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IDocument, IHeaderInformation, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushObjArray } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { addDays, generateKeywords, groupBy, toCompany, toDateFromTimePickerData, toDepartment, toDepartmentNoWorkplace, toNameKey, toTimePickerData, toUniq, toWorkplaceKeys } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { map, take, debounceTime } from "rxjs/operators";
import { Router } from '@angular/router';
import { ACCOUNT_PERMISSION_OBJECT, DOCUMENT_TYPE_OBJECT, PRIORITY_OBJECT } from 'src/app/dummy/config';
import { toJS } from 'mobx';
import { DataService } from 'src/app/shared/services/data.service';
import { docStatusObj } from 'src/app/dummy/status';

@Component({
  selector: 'app-inbox-form',
  templateUrl: './inbox-form.component.html',
  styleUrls: ['./inbox-form.component.scss']
})
export class InboxFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "លិខិតកំណត់បង្ហាញ";

  form: FormGroup;
  hashtagItems: string[] = [];

  process: boolean = false;
  showVerifyFromAssistantGeneral: boolean = false;
  showVerifyFromAssistantDepartment: boolean = false;
  showVerifyFromAssistantMinistry: boolean = false;

  loading: boolean = true;
  workplaceOptions: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<InboxFormComponent>,
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
    const headerDocument = this.data?.headerDocument as IHeaderInformation;
    const item = this.data?.item as IHeaderInformation;
    const { config } = this.auth;
    // this.store.userAccountPermission = [];
    const deadlineDate = addDays(new Date(), 3)
    this.hashtagItems = []
    this.hashtagItems = item?.hashtag || headerDocument?.hashtag || []
    this.form = this.fb.group({
      name: [item?.documentTitle || headerDocument?.documentTitle, [Validators.required]],
      documentNo: [null, [Validators.required], this.checkExistRef()],
      hashtag: [null],
      deadline: [deadlineDate, [Validators.required]],
      workplaces: [[], [Validators.required]],
      verifyFromAssistantGeneral: [null],
      verifyFromAssistantDepartment: [null],
      verifyFromAssistantMinistry: [null],
      receivedDate: [deadlineDate, [Validators.required]],
      receiveTimePicker: [toTimePickerData(deadlineDate), [Validators.required]]
    })
    const { verifyFromAssistantMinistry, verifyFromAssistantGeneral, verifyFromAssistantDepartment } = config
    this.showVerifyFromAssistantMinistry = verifyFromAssistantMinistry || false;
    this.showVerifyFromAssistantGeneral = verifyFromAssistantGeneral || false;
    this.showVerifyFromAssistantDepartment = verifyFromAssistantDepartment || false;
    this.workplaceOptions = this.auth?.currentDepartment?.workplace || [];
    if (item) {
      const { receiveTime, receivedDate, documentTitle, documentNo, hashtag, deadline, workplaces, verifyFromAssistantGeneral, verifyFromAssistantDepartment, verifyFromAssistantMinistry } = item;
      this.hashtagItems = hashtag || []
      this.form.patchValue({
        name: documentTitle,
        documentNo: documentNo,
        deadline: deadline ? deadline?.toDate() : deadlineDate,
        workplaces: workplaces?.filter(m => m?.requestApproved) || [],
        verifyFromAssistantGeneral: verifyFromAssistantGeneral || false,
        verifyFromAssistantDepartment: verifyFromAssistantDepartment || false,
        verifyFromAssistantMinistry: verifyFromAssistantMinistry || false,
        receivedDate: receivedDate ? receivedDate?.toDate() : deadlineDate,
        receiveTimePicker: receiveTime ? toTimePickerData(receiveTime?.toDate()) : toTimePickerData(deadlineDate),
      })
      this.workplaceOptions = item?.workplaces || this.auth?.currentDepartment?.workplace || [];
      if (verifyFromAssistantDepartment) {
        this.form.controls['verifyFromAssistantDepartment'].enable();
      } else {
        this.form.controls['verifyFromAssistantDepartment'].disable();
      }
      if (verifyFromAssistantGeneral) {
        this.form.controls['verifyFromAssistantGeneral'].enable();
      } else {
        this.form.controls['verifyFromAssistantGeneral'].disable();
      }
      this.loading = false;
    } else {
      const { currentDepartment } = this.auth;
      let workplace = (currentDepartment?.workplace || []);
      const { doc_status_level } = headerDocument;

      if (item?.workplaces?.find(m => m?.order === 0.5 && m?.requestApproved)) {
        this.form.controls['verifyFromAssistantMinistry'].enable();
      } else {
        this.form.controls['verifyFromAssistantMinistry'].disable();
      }
      if (item?.workplaces?.find(m => m?.order === 1 && m?.requestApproved)) {
        this.form.controls['verifyFromAssistantGeneral'].enable();
      } else {
        this.form.controls['verifyFromAssistantGeneral'].disable();
      }
      if (item?.workplaces?.find(m => m?.order === 2 && m?.requestApproved)) {
        this.form.controls['verifyFromAssistantDepartment'].enable();
      } else {
        this.form.controls['verifyFromAssistantDepartment'].disable();
      }
      switch (doc_status_level?.order) {
        case 0.5:
          workplace = currentDepartment?.workplacePath
          this.form.controls['verifyFromAssistantGeneral'].enable();
          this.form.patchValue({
            verifyFromAssistantGeneral: verifyFromAssistantGeneral || false,
          })
          break;
        case 1:
          workplace = currentDepartment?.workplacePath?.filter(m => m?.order >= 2)
          this.form.controls['verifyFromAssistantDepartment'].enable();
          this.form.patchValue({
            verifyFromAssistantDepartment: verifyFromAssistantDepartment || false,
          })
          break;
        case 2:
          workplace = currentDepartment?.workplacePath?.filter(m => m?.order >= 3)
          break;
        default:
          workplace = currentDepartment?.workplacePath?.filter(m => m?.key === currentDepartment?.key)
          break;
      }
      this.form.patchValue({
        workplaces: workplace
      })
      this.loading = false;
    }
  }

  ngOnDestroy() {
    // this.store.userAccountPermission = []
  }


  onSelectedWorkplace(event) {
    const { selected, value } = event?.option;
    const { verifyFromAssistantMinistry, verifyFromAssistantGeneral, verifyFromAssistantDepartment } = this.auth?.config;
    switch (value?.order) {
      case 0.5:
        if (selected) {
          this.form.patchValue({
            verifyFromAssistantMinistry: verifyFromAssistantMinistry,
          })
          this.form.controls['verifyFromAssistantMinistry'].enable();
        } else {
          this.form.controls['verifyFromAssistantMinistry'].disable();
        }
        break;
      case 1:
        if (selected) {
          this.form.patchValue({
            verifyFromAssistantGeneral: verifyFromAssistantGeneral,
          })
          this.form.controls['verifyFromAssistantGeneral'].enable();
        } else {
          this.form.controls['verifyFromAssistantGeneral'].disable();
        }
        break;
      case 2:
        if (selected) {
          this.form.patchValue({
            verifyFromAssistantDepartment: verifyFromAssistantDepartment,
          })
          this.form.controls['verifyFromAssistantDepartment'].enable();
        } else {
          this.form.controls['verifyFromAssistantDepartment'].disable();
        }
        break;
      default:
        break;
    }
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
      const { name, documentNo, deadline, workplaces, verifyFromAssistantGeneral, verifyFromAssistantDepartment, receivedDate, receiveTimePicker, verifyFromAssistantMinistry } = f;
      const receivedTime = toDateFromTimePickerData(receivedDate, receiveTimePicker);
      const key = item?.key || this.ds.createId();
      const { uid } = this.auth;
      let keywords = generateKeywords([documentNo, name]);
      if (this.hashtagItems && this.hashtagItems.length > 0) {
        keywords = keywords.concat(this.hashtagItems.map(r => (`${r}`.trim().toLocaleUpperCase())))
      }
      const { currentDepartment, selectedCompany } = this.auth;
      if (!item) {
        await this.fetchUserPermission()
      }
      // const userAccountPermission = item ? this.store?.userPermission : this.store?.userAccountPermission;
      // const approvedByKeys = item?.approvedByKeys || userAccountPermission.filter(m => m?.permission?.key === 2 || m?.permission?.key === 3).map(m => m?.key).filter(m => m !== uid);
      // const peopleKeys = item?.peopleKeys || userAccountPermission.map(m => m.key)

      // await this.fetchUserPermission()
      // const userAccountPermission = this.store?.userAccountPermission;
      // const approvedByKeys = userAccountPermission.filter(m => m?.permission?.key === 2 || m?.permission?.key === 3).map(m => m?.key).filter(m => m !== uid);
      // const peopleKeys = userAccountPermission.map(m => m.key)

      const headerDocument = this.data?.headerDocument as IHeaderInformation;
      const docParentData = toUniq((headerDocument?.doc_parentData || []).concat([key]))
      const { documentDataDoc } = this.store;
      // const headerData: IHeaderInformation = {
      //   key: key,
      //   status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
      //   created_at: item?.created_at || this.ds.serverTimestamp(),
      //   created_by: item?.created_by || uid,
      //   updated_by: uid,
      //   updated_at: this.ds.serverTimestamp(),
      //   page_key: item?.page_key || ConvertService.pageKey(),
      //   isDelete: false,
      //   keyword: keywords,
      //   documentType: item?.documentType ?? null,
      //   //send cc and bcc
      //   documentTitle: name,
      //   documentNo: documentNo,
      //   receiveTime: receivedTime,
      //   receiveTimePicker: receiveTimePicker,
      //   receivedDate: receivedDate,

      //   documentNoKey: toNameKey(documentNo),
      //   organizationRef: item?.organizationRef ?? null,
      //   hashtag: this.hashtagItems ?? [],
      //   priority: item?.priority ?? PRIORITY_OBJECT.NORMAL,
      //   documentKey: item?.documentKey ?? null,
      //   doc_parent: headerDocument?.key,
      //   doc_status: item?.doc_status ?? docStatusObj.hold,
      //   doc_status_level: currentDepartment?.ranking || currentDepartment?.ranking,
      //   //org chart
      //   company: selectedCompany ? toCompany(selectedCompany) : null,
      //   workplaces: workplaces?.map(m => ({ ...m, requestApproved: true })),
      //   workplaceKeys: workplaces?.map(m => m?.key),
      //   workplace: item?.workplace || toDepartmentNoWorkplace(currentDepartment),
      //   receivedWorkplace: item?.receivedWorkplace || [],
      //   receivedWorkplaceKeys: item?.receivedWorkplaceKeys || [],
      //   approvedByKeys: approvedByKeys || [],
      //   completedByKeys: item?.completedByKeys || [],
      //   copyToKeys: item?.copyToKeys || [],
      //   workplaceOptions: this.workplaceOptions,
      //   workplacePath: toWorkplaceKeys(currentDepartment?.workplacePath),
      //   peopleKeys: peopleKeys,
      //   final: item?.final || false,
      //   files: item?.files || [],
      //   deadline: deadline,
      //   deadlineKey: ConvertService.toDateKey(deadline),
      //   verifyFromAssistantGeneral: verifyFromAssistantGeneral || false,
      //   verifyFromAssistantDepartment: verifyFromAssistantDepartment || false,
      //   verifyFromAssistantMinistry: verifyFromAssistantMinistry || false,
      //   completedWorkplaceKeys: item?.completedWorkplaceKeys || [],
      //   receivedWorkplaceCompletedByDocKeys: item?.receivedWorkplaceCompletedByDocKeys || [],
      //   doc_type: item?.doc_type || DOCUMENT_TYPE_OBJECT.RECEIVED_MEMO,
      //   doc_parentData: docParentData,
      // }
      // const data: IDocument = {
      //   key: key,
      //   status: document ? (document.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
      //   created_at: document?.created_at || this.ds.serverTimestamp(),
      //   created_by: document?.created_by || this.auth.uid,
      //   updated_by: this.auth.uid,
      //   updated_at: this.ds.serverTimestamp(),
      //   page_key: document?.page_key || ConvertService.pageKey(),
      //   isDelete: false,
      //   keyword: keywords,
      //   name: name,
      //   displayName: name,
      //   documentNo: documentNo,
      //   title: document?.title || `<p style="text-align:center;" data-placeholder="បញ្ចូលចំណងជើង....."><span style="font-family:'khmer os muol light', khmer_os_muol_light;"><u>កំណត់បង្ហាញ</u></span></p>`,
      //   files: document?.files ?? null,
      //   objective: document?.objective ?? null,
      //   reference: document?.reference ?? null,
      //   description: document?.description ?? null,
      //   header: document ? document?.header : (documentDataDoc?.header || []),
      //   footer: document ? document.footer : [],
      //   headerInformationRef: document?.headerInformationRef || null,
      //   doc_parent: document?.doc_parent || null,
      // }
      // this.store.addMemo(data, headerData, headerDocument, userAccountPermission, [], currentDepartment, (success, res) => {
      //   this.form.enable();
      //   this.process = false;
      //   if (success) {
      //     this.snackBar.open(`Document has been saved successful.`, "Done", {
      //       duration: 1000,
      //       verticalPosition: 'bottom',
      //       horizontalPosition: 'end',
      //     });
      //     this.form.reset();
      //     this.inputRef.nativeElement.focus();
      //     if (this.data.req || this.data.item) {
      //       this.dialogRef.close(data);
      //     } else {
      //       this.router.navigate([`/documents/form/${headerData?.key}/${headerData?.workplace?.key}/design`])
      //       this.dialogRef.close(data)
      //     }
      //   } else {
      //     alert(res)
      //   }
      // })
    }
  }


  async fetchUserPermission() {
    const { workplaces, verifyFromAssistantDepartment, verifyFromAssistantMinistry, verifyFromAssistantGeneral } = this.form.value
    const { currentDepartment, selectedCompany,
      config, employee } = this.auth;
    const { startFromLevel, assistantDepartmentPosition, assistantGeneralPosition, assistantMinistryPosition } = config;

    let userPermissionData: any[] = [];
    const ministry = workplaces.find(m => m?.order === 0.5)
    const generalDepartment = workplaces.find(m => m?.order === 1)
    const department = workplaces.find(m => m?.order === 2)
    const office = workplaces.find(m => m?.order === 3)
    const subOffice = workplaces.find(m => m?.order === 4)

    if (ministry && startFromLevel) {
      if (selectedCompany?.headerOfficer?.length > 0) {
        selectedCompany?.headerOfficer?.map(officer => {
          const item = {
            ...officer,
            workplaceKey: ministry?.key,
            permission: ACCOUNT_PERMISSION_OBJECT.canApproved,
            head: true,
            assistant: false,
            ranking: selectedCompany?.ranking,
          }
          userPermissionData = pushObjArray(userPermissionData, item)
        })
      }
      if (verifyFromAssistantMinistry && assistantMinistryPosition) {
        const assistants = await this.store.fetchAssistantOfDepartment(assistantMinistryPosition?.key, ministry?.key);
        if (assistants.length > 0) {
          assistants?.map(m => {
            userPermissionData = pushObjArray(userPermissionData,
              {
                ...m,
                workplaceKey: ministry?.key,
                permission: ACCOUNT_PERMISSION_OBJECT.canConfirm,
                head: false,
                assistant: true,
                ranking: selectedCompany?.ranking,
              })
          })
        }
      }
    }
    
   
   
    if (subOffice) {
      currentDepartment?.headerOfficer?.map(officer => {
        const item = {
          ...officer,
          workplaceKey: currentDepartment?.key,
          permission: ACCOUNT_PERMISSION_OBJECT.canApproved,
          head: true,
          assistant: false,
          ranking: currentDepartment?.ranking,
        }
        userPermissionData = pushObjArray(userPermissionData, item)
      })
    }
    const item = {
      ...employee,
      workplaceKey: currentDepartment?.key,
      permission: ACCOUNT_PERMISSION_OBJECT.canConfirm,
      head: false,
      assistant: false,
      ranking: currentDepartment?.ranking,
    }
    userPermissionData = pushObjArray(userPermissionData, item);
    // this.store.userAccountPermission = userPermissionData;
  }


}
