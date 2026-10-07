import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { PRIORITY_OBJECT } from 'src/app/dummy/config';
import { docStatusObj, DOC_CATEGORY_OBJ } from 'src/app/dummy/status';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords, MappingService, pageKey, toCompany, toDateKey, toDepartmentNoWorkplace, toNameKey, toUserAccount } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { AnnouncementStore } from 'src/app/stores/document/announcement.store';

@Component({
    selector: 'app-announcement-form',
    templateUrl: './announcement-form.component.html',
    styleUrls: ['./announcement-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AnnouncementFormComponent implements OnInit {
  @ViewChild('photoFile') photoFile: ElementRef;

  form : UntypedFormGroup;
  titleForm: any = "បង្កើតសេចក្តីប្រកាស";
  search = false;
  documentCategory : AbstractControl;
  documentSource : AbstractControl;
  officers : AbstractControl;

  filterDocumentCategory : Observable<any[]>;
  filterDocumentSource : Observable<any[]>;
  searchData : any = [];
  searching: boolean = false;

  emptyPhoto = PHOTO_LIB.EMPTY_AVATAR;
  selectedOfficers = [];

  selectedFile: any = [];
  uploadedFile: any = [];
  removeFiles: any = [];
  processing = false

  constructor(
    public dialogRef: MatDialogRef<AnnouncementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: AnnouncementStore,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public storage: FireStorageService,
    private dialog: MatDialog,
  ) { }
  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      documentName: [null, [Validators.required]],
      refNo: [null, [Validators.required]],
      link: [null],
      receivedDate: [new Date()],
      documentCategory: [null, Validators.compose([MappingService.validSelected.bind(this)])],
      documentSource: [null, Validators.compose([MappingService.validSelected.bind(this)])],
      public_status: [false]
    })
    this.documentCategory = this.form.get('documentCategory');
    const category = await this.store.getCategory();
    this.filterDocumentCategory = MappingService.autoComplete(this.documentCategory,category,'name')

    this.documentSource = this.form.get('documentSource');
    const source = await this.store.getInstitution();
    this.filterDocumentSource = MappingService.autoComplete(this.documentSource,source,'name')


    if (this.data?.item) {
      this.titleForm = "កែប្រែសេចក្តីប្រកាស"
      const item = this.data.item
      const {documentTitle, refNo, link, calendar_date, documentType, organizationRef} = item
      this.form.patchValue({
        documentName : documentTitle,
        refNo,
        link,
        receivedDate : calendar_date?.toDate(),
        documentCategory: documentType,
        documentSource: organizationRef,
      })
      this.uploadedFile = item.files;
      this.selectedOfficers = item.selectedOfficers || [];
      if(item?.peopleKeys?.find(f=>f==='___PUBLIC___')){
        this.form.patchValue({public_status: true})
      }
    }
  }

  async onSelectedFile(files) {
    for await (const image of files) {
      if(image.type!=='application/pdf'){
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (event) => {
          this.selectedFile.push({file:image,img:event.target.result});
        }
      }else{
        this.selectedFile.push({file:image});
      }
    }
    this.photoFile.nativeElement.value = "";
  }

  onURL = (image: any, i: number, isData: boolean) => {
    if (isData) {
      this.selectedFile = this.selectedFile.filter((el, index) => index !== i);
    } else {
      this.uploadedFile = this.uploadedFile?.filter(m => m?.key !== image?.key);
      this.removeFiles.push(image)
    }
  }

  async _onSave(f){

    if(!this.form?.valid) return;

    this.processing = true;
    this.form.disable();

    const { documentName, refNo, link, receivedDate, documentCategory, documentSource, public_status } = f

    let peopleKeys = [];
    let selectedOfficers = [];
    if(!public_status){
      peopleKeys = this.selectedOfficers.map(e => e.key)
      selectedOfficers = this.selectedOfficers
    }else{
      peopleKeys = ['___PUBLIC___']
    }


    let keywords = generateKeywords([refNo, documentName]);
    if (refNo) {
      keywords = keywords.concat([refNo.toUpperCase()])
    }
    if (documentName) {
      keywords = keywords.concat([documentName.toUpperCase()])
    }
    if (this.auth.profile?.key) {
      keywords = keywords.concat([this.auth?.profile?.key])
    }
    if (this.auth?.currentDepartment?.key) {
      keywords = keywords.concat([this.auth?.currentDepartment?.key])
    }
    if (documentCategory?.key) {
      keywords = keywords.concat([documentCategory?.key])
    }
    if (documentSource?.key) {
      keywords = keywords.concat([documentSource?.key])
    }
    if (peopleKeys.length > 0) {
      keywords = keywords.concat(...peopleKeys)
    }

    const announcement_data: any = {
      key: this.data?.item?.key|| this.ds.createId(),
      status: STATUS_OBJ.ACTIVE,
      isDelete: false,
      calendar_date: receivedDate,
      calendar_date_key: toDateKey(receivedDate),
      created_by: this.data?.item?.created_by || this.auth?.profile?.key,
      created_at: this.data?.item?.created_at || this.ds.serverTimestamp(),
      updated_by: this.auth?.profile?.key,
      updated_at: this.ds.serverTimestamp(),
      page_key: pageKey(),

      keyword: keywords,
      owner_profile: this.data?.item?.owner_profile || toUserAccount(this.auth?.profile) || null,
      documentType: toCompany(documentCategory) || null,
      documentTitle: documentName || null,
      refNo: refNo || "",
      document_category: DOC_CATEGORY_OBJ.announcement,
      organizationRef: toCompany(documentSource) || null,
      category: toCompany(documentCategory) || null,
      workplaceAssistants: null,
      workplace: toDepartmentNoWorkplace(this.auth?.currentDepartment),
      workplaceKeys: this.auth?.currentDepartment?.key,
      approvedByKeys: null,
      peopleKeys: peopleKeys,
      accountKeys: this.auth.profile?.key,
      priority: PRIORITY_OBJECT.NORMAL,
      documentKey: toNameKey(documentName),
      doc_status: docStatusObj.hold,
      doc_status_level: this.auth?.currentDepartment?.ranking,
      company: this.data?.item?.company || this.auth?.selectedCompany ? toCompany(this?.auth?.selectedCompany) : null,
      receivedWorkplace: [],
      receivedWorkplaceKeys: [],
      files: this.uploadedFile,
      doc_parent: null,
      doc_parentData: null,
      completedWorkplaceKeys: [],
      receivedWorkplaceCompletedByDocKeys: [],
      doc_type: null,
      link: link || null,

      selectedOfficers : selectedOfficers,
    }

    if(this.selectedFile.length > 0){
      const files = await this.storage.uploadMulti(this.selectedFile)
      announcement_data.files = announcement_data.files.concat(files||[])
    }

    if(this.removeFiles.length > 0){
      this.storage.delete(this.removeFiles)
    }

    this.store.save(announcement_data,res=>{
      this.form.reset();
      this.form.enable();
      this.selectedFile = [];
      this.uploadedFile = [];
      this.removeFiles = [];
      this.selectedOfficers = [];
      this.processing = false;
      this.snackBar.open(`ទិន្នន័យត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធដោយជោគជ័យ.`, "ជោគជ័យ", { duration: 3000 });
    })

  }

  async onSearchOfficer(str){
    this.searching = true;
    if(str){
      this.searchData = await this.store.searchOfficer(str);
      this.searching = false;
    }else{
      this.searchData = []
      this.searching = false;
    }
  }

  onSelectedOfficer(event){
    this.selectedOfficers.find(e => e.key === event.key) ? null : this.selectedOfficers.push(toUserAccount(event))
  }

  removeOfficer(item){
    this.selectedOfficers = this.selectedOfficers.filter(e => e.key !== item.key)
  }

}
