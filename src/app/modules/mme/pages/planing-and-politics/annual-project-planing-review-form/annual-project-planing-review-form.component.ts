import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APPROVAL_STATUS_OBJECT, APPROVAL_TASK_OBJECT, APPROVAL_TYPE_OBJECT, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IQuarter, ISubmitReport } from 'src/app/interfaces/document/document.interface';
import { ConvertService, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService, toDepartmentNoWorkplace, toEmployee, toProject } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';
import { lastValueFrom, Observable } from 'rxjs';
import { DepartmentStore } from 'src/app/stores/document/department.store';
import { FirestorageFilesUploadService } from 'src/app/shared/services/firestorage-files-upload.service';

@Component({
  selector: 'app-annual-project-planing-review-form',
  templateUrl: './annual-project-planing-review-form.component.html',
  styleUrls: ['./annual-project-planing-review-form.component.scss']
})
export class AnnualProjectPlaningReviewFormComponent implements OnInit {
  title = ``;
  selectedQuarter: IQuarter = null;
  loading: boolean = true;
  process: boolean = false;
  APPROVAL_TASK_OBJECT = APPROVAL_TASK_OBJECT;
  APPROVAL_STATUS_OBJECT = APPROVAL_STATUS_OBJECT;

  selectedFiles: any = [];

  form : FormGroup;

  filteredDepartmentOptions: Observable<any[]>;
  rejectDepartment: AbstractControl;
  departmentData = [];
  annualProjectQuarter;

  constructor(public dialogRef: MatDialogRef<AnnualProjectPlaningReviewFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: ProjectStore,
    private departmentStore: DepartmentStore,
    private ds: DatabaseService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private fb : FormBuilder,
    private uploadService: FirestorageFilesUploadService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      rejectComment: [null,[Validators.required]],
      rejectDepartment: [null, [Validators.required, MappingService.validSelected.bind(this)]],
    })
    this.rejectDepartment = this.form.get('rejectDepartment');
    const { quarter } = this.data;
    this.selectedQuarter = quarter;
    this.title =this.store?.planingAndReport?`${this.store?.planingAndReport?.name_kh}${APPROVAL_TASK_OBJECT?.planing?.key === this.store?.planingAndReport?.key ? quarter?.name : ''}`:`ស្មើអនុម័តផែនការប្រចាំត្រី`;

    if(this.data?.approvalStatus?.key === APPROVAL_STATUS_OBJECT?.MODIFY?.key){
      this.annualProjectQuarter = pushToObject(await lastValueFrom(this.ds.annualProjectQuarterRef(this.auth?.planing?.key).doc(quarter.key).get()));
      const { approvedWorkplaceKeys } = this.annualProjectQuarter
      this.departmentData = pushToArray(await lastValueFrom(this.ds.departmentLatestRef().get()))
      const userWorkplaceKey = this.auth.currentDepartment.key;
      const departmentDoc = this.departmentData.filter(f=>(f?.subOfDepartment?.key === userWorkplaceKey) && approvedWorkplaceKeys?.find(e=>e===f?.key))
      this.filteredDepartmentOptions = MappingService.autoComplete( this.rejectDepartment,departmentDoc, 'fullName')
    }

    this.loading = false;
  }

  async _onSave() {

    if(this.data.approvalStatus.key === APPROVAL_STATUS_OBJECT.MODIFY.key && !this.form.valid){
      return;
    }

    this.store.processSaving = true;

    this.process = true;
    const { project, quarter, approvalStatus,approvalType } = this.data;
    const { currentDepartment, employee, config } = this.auth;

    let rejectApproveOfficerKeys:string[] =  []
    let rejectWorkplaces = []
    let uploadFiles = [];
    let rejected_by = null;

    if(this.data.approvalStatus.key === APPROVAL_STATUS_OBJECT.MODIFY.key){
      const selectedDepartment = this.form.value.rejectDepartment?.key;
      rejectWorkplaces = rejectWorkplaces.concat(selectedDepartment)
      const getAllSubDepartment=()=>{
        const subDepartment = this.departmentData.filter(f=> rejectWorkplaces.find(k=>k===f.subOfDepartment?.key))
        let departmentKey = subDepartment.map(f=>f.key)
        departmentKey = departmentKey.filter(f=> !rejectWorkplaces.find(k=>k===f))
        if(departmentKey?.length>0){
          rejectWorkplaces = rejectWorkplaces.concat(departmentKey.filter((item) => rejectWorkplaces.indexOf(item) < 0))
          getAllSubDepartment();
        }
      }
      getAllSubDepartment()
      const { approvedWorkplaceKeys , approvedOfficerKeys } = this.annualProjectQuarter
      rejectWorkplaces = rejectWorkplaces.filter(f=> approvedWorkplaceKeys.find(k=>k===f))
      for await (const item of rejectWorkplaces){
        const docs = await this.departmentStore.getDepartmentMember(item)
        rejectApproveOfficerKeys = rejectApproveOfficerKeys.concat(docs.map(f=>f.key))
      }
      rejectApproveOfficerKeys = rejectApproveOfficerKeys.filter(f=> approvedOfficerKeys.find(k=>k===f))

      if(this.selectedFiles.length>0){
        for await (const item of this.selectedFiles){
          const file = await this.uploadService.upload('files',item)
          uploadFiles.push(file)
        }
      }
      rejected_by = this.auth?.User
    }else{
      this.store.canReject = false;
    }

    const item: ISubmitReport = {
      key: `${quarter?.key}_${project?.key}_${currentDepartment?.key}`,
      status: STATUS_OBJ.ACTIVE,
      created_at: this.ds.serverTimestamp(),
      created_by: this.auth.uid,
      updated_by: this.auth.uid,
      updated_at: this.ds.serverTimestamp(),
      page_key: ConvertService.pageKey(),
      isDelete: false,

      workplace: toDepartmentNoWorkplace(currentDepartment),
      subOfWorkplace: currentDepartment?.subOfDepartment || null,
      project: toProject(project),
      quarter: { key: quarter?.key, name_en: quarter?.name_en, order: quarter?.order },
      semester: quarter?.semester,
      profile: toEmployee(employee),
      finalApproved: config?.startFromLevel?.key === currentDepartment?.ranking?.key,
      approvalStatus: approvalStatus || APPROVAL_STATUS_OBJECT?.REQUEST,
      approvalType:approvalType ||APPROVAL_TYPE_OBJECT.planing,
      rejectWorkplaces: rejectWorkplaces || null,
      rejectApproveOfficerKeys: rejectApproveOfficerKeys || null,
      rejectComment: this.form?.value?.rejectComment || null,
      files:  uploadFiles || null,
      rejected_by : rejected_by || null,
    }
    this.store.submitReview(item).then(async () => {
      this.snackBar.open(`${this.store?.planingAndReport?.name_kh || 'ផែនការប្រចាំត្រី'}ត្រូវបានដាក់ឲ្យពិនិត្យលើផែនការត្រីមាស`, "ជោគជ័យ", { duration: 3000 });
      this.dialogRef.close('yes')
    }).catch(error => {
      alert(error)
    }).finally(() => {
      this.process = false;
      setTimeout(() => {
        this.store.processSaving = false;
      }, 5000);
    })
  }

  onSelectedFile = (files) => {
    for (let index = 0; index < files.length; index++) {
      const element = files[index];
      const { type } = element;
      const appType = `${type}`.startsWith('image') ? 'image' : 'application';
      element.fileType = appType;
      this.selectedFiles.push(element)
    }
  }

  onRemoveFile(file) {
   this.selectedFiles = this.selectedFiles?.filter(m => m?.name !== file?.name)
  }

}
