import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IDepartment, IPosition } from 'src/app/interfaces/document/document.interface';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { orderBy } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { groupBy, MappingService, toCompany, toDepartment, toFlatten, toRanking, toUniq, toUserAccount } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore, DynamicFlatNode, ProjectDataSource } from 'src/app/stores/document/document.store';
import { OfficerStore } from 'src/app/stores/document/officer.store';
import { HrStore } from '../../stores/hr.store';

@Component({
    selector: 'app-human-resource-approval',
    templateUrl: './human-resource-approval.component.html',
    styleUrls: ['./human-resource-approval.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HumanResourceApprovalComponent implements OnInit {

  form: UntypedFormGroup;
  position: AbstractControl;
  filterPosition: Observable<IPosition[]>;

  selectedItem: any[] = [];
  loading:boolean=true;
  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSource: ProjectDataSource;
  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.expandable;
  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

  constructor(
    public dialogRef: MatDialogRef<HumanResourceApprovalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: OfficerStore,
    public ds: DataService,
    private auth: AuthStore,
    public hr: HrStore,
    private snackBar: MatSnackBar,
    public document:DocumentStore,
    private dialog:MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      position: [null,[Validators.required, MappingService.validSelected.bind(this)]],
    })
    this.position = this.form.controls['position']


    await this.document.fetchWorkplaces();
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new ProjectDataSource(this.treeControl, this.document);
    this.dataSource.data = this.document.initialData();

    const positions = await this.store.fetchManagementLevel();
    this.filterPosition = MappingService.autoComplete(this.position, positions, "name");
    this.loading=false;
  }

  addItem(workplace,form:any){
    if(this.form.valid){
      if (!this.selectedItem.find(f => ((f?.workplace?.key === workplace?.key) && (f?.position?.key === form?.position?.key))))
      this.selectedItem.push({
        workplace: workplace,
        position: form?.position
      });
    }
    else{
      this.openAlertDialog()
    }
  }

  process: boolean = false;
  async _onSave(f) {
    if (this.selectedItem?.length === 0) return;
    this.process = false;
    this.form.disable()
    const { selectedOfficer } = this.hr;
    const { uid, selectedCompany, employee } = this.auth;
    const workplaceAndPositions = this.selectedItem?.map(m => {
      const { position, workplace } = m;
      const item = {
        key: `${workplace.key}_${position.key}`,
        office: toDepartment(workplace),
        position: toRanking(position),
        updated_by: uid,
        updated_at: this.ds.serverTimestamp()
      }
      return item;
    })
    const positions = groupBy(toFlatten(workplaceAndPositions.map(m => m?.position)), "key")
    const offices = toUniq(toFlatten(workplaceAndPositions.map(m => m.office?.workplace?.map(d => d?.key))));
    const workplaceOfOfficer = groupBy(toFlatten(workplaceAndPositions.map(m => m.office)), "key");
    let officeItems: any[] = []
    workplaceAndPositions.map(m => {
      const items = m?.office?.workplace;
      if (Array.isArray(items)) officeItems.push(items[items.length - 1])
    })
    const workplaces = orderBy(groupBy(officeItems, "key"), "order") as any[];
    const currentWorkplace = workplaceOfOfficer?.length > 0 ? workplaceOfOfficer[0] : null;
    const data = {
      ...selectedOfficer,
      positions: positions,
      positionKeys: positions?.length > 0 ? positions.map(m => m?.key) : [],
      position: positions?.length > 0 ? positions[0] : null,
      positionWorkplaceKeys: workplaceAndPositions.map(m => (`${m?.office?.key}_${m?.position?.key}`)),
      officeKeys: offices?.length > 0 ? offices : [],
      workplace: workplaces || [],
      workplaceKeys: workplaces.map(m => m?.key) || [],
      currentDepartment: currentWorkplace,
      workplaceKey: currentWorkplace?.key || null,
      company: selectedCompany ? toCompany(selectedCompany) : null,
      updated_by: uid,
      updated_at: this.ds.serverTimestamp(),
      status: STATUS_OBJ.ACTIVE,
      approvedBy: toUserAccount(employee),
      approvedAt: this.ds.serverTimestamp(),
    }
    await this.store.save(data, (success, res) => {
      this.form.enable();
      if (success) {
        this.snackBar.open(`Officer application has been approved successful.`, "Done", { duration: 3000 });
        this.form.reset();
        this.store.workingOffices = []
        this.store.position = []
        this.dialogRef.close(data);
      } else {
        alert(res);
      }
    })
  }

  unSelectedWorkplace(item) {
    this.selectedItem = this.selectedItem.filter(f => !((f?.workplace?.key === item?.workplace?.key) && (f?.position?.key === item?.position?.key)))
  }

  openAlertDialog(){
    this.dialog.open(ConfirmSuccessComponent,{
      data:{
        title:'ជំនួយ',
        memo: 'សូមបញ្ចូលព័ត៌មានមុខងារតួនាទីជាមុនសិន។'
      }
    })
  }
}
