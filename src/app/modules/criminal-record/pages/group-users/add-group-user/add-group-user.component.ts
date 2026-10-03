import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, take, debounceTime } from "rxjs/operators";
import { MatStepper } from '@angular/material/stepper';
// import { AddGroupPermissionComponent } from '../add-group-permission/add-group-permission.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { IGroupUser } from 'src/app/interfaces/user';
import { BaseStore } from 'src/app/stores/base.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { GroupsAccountStore } from '../../../stores/groups-account.store';
import { DataService } from 'src/app/shared/services/data.service';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { programArray } from 'src/app/dummy/status';
import { MatSelectionListChange } from '@angular/material/list';

interface PermissionNode {
  name: string;
  key: string;
  children?: PermissionNode[];
}
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  node: any;
  level: number;
}

@Component({
  selector: 'app-add-group-user',
  templateUrl: './add-group-user.component.html',
  styleUrls: ['./add-group-user.component.scss']
})
export class AddGroupUserComponent implements OnInit {
  TITLE: any = "បង្កើតក្រុមសិទ្ធិប្រើប្រាស់"
  filteredStateLevel: any;
  filteredStateSubject: any;

  form: FormGroup;
  name: AbstractControl;

  formProgram: FormGroup;

  process: boolean;
  ITEM: IGroupUser;
  loading = true;
  schoolPrograms = programArray
  constructor(
    public dialogRef: MatDialogRef<AddGroupUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: GroupsAccountStore,
    private fb: FormBuilder,
    public list: BaseStore,
    public auth: AuthStore,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public ds: DataService,
    private changeRef: ChangeDetectorRef,

  ) { }
  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  private _transformer = (node: PermissionNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(this._transformer, node => node.level, node => node.expandable, node => node.children);
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  async ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required], this.checkExistOnEdit()],
      isAdmin: [false],
      isCompletedApplicationOnly: [false],
      isBranchManager: [false],
      isCashier: [false],
      isAllCampus: [false],
      isEmbassy: [false],
      isAdminMOL: [false],
      isAdminMOD: [false]
    })
    this.name = this.form.controls['name'];
    this.formProgram = this.fb.group({
      program: [null]
    })
    const { item } = this.data;
    const { permissions_tree_data } = this.store;
    this.dataSource.data = permissions_tree_data;
    this.ITEM = item || null;
    if (this.ITEM) {
      console.log("ITEM", this.ITEM)
      const { name, isAdmin, isCashier, isBranchManager, programs, isAllCampus, isCompletedApplicationOnly, isEmbassy, isAdminMOL, isAdminMOD } = this.ITEM;
      this.form.patchValue({
        name: name,
        isAdmin: isAdmin || false,
        isCashier: isCashier || false,
        isAllCampus: isAllCampus || false,
        isCompletedApplicationOnly: isCompletedApplicationOnly || null,
        isBranchManager: isBranchManager || false,
        isEmbassy: isEmbassy || false,
        isAdminMOL: isAdminMOL || false,
        isAdminMOD: isAdminMOD || false
      })
      this.TITLE = "កែសម្រួលក្រុមសិទ្ធិប្រើប្រាស់";
      this.formProgram.patchValue({ program: programs })
    }
    this.loading = false;
  }

  selectionChangeProgram(event: MatSelectionListChange) {
    const { uid } = this.auth;
    this.store.saveGroupProgram(this.formProgram?.value?.program, this.ITEM, uid, (success, res) => {
      if (success) {
        this.ITEM.programKeys = this.formProgram?.value?.program.map(m => m.key);
        this.ITEM.programs = this.formProgram?.value?.program.map(m => ({ key: m.key, name: m.name }));
        this.data.item = this.ITEM;
        this.snackBar.open(`Program has been added to group successful.`, "Done", { duration: 1000 });
      } else {
        alert(res)
      }
    })
  }

  checkExistOnEdit() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value !== null && value !== "" && value !== undefined) {
        return this.ds.groupModulesRef(ref => ref.where("name", "==", `${value}`.trim())).valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = this.ITEM ? this.ITEM.name : null;
              if (oldValue && oldValue === `${value}`.trim()) {
                return null;
              }
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

  onSave() {
    if (!this.ITEM) return;
    const dialogRef = this.dialog.open(AddGroupUserComponent, {
      data: { item: null, group: this.ITEM },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    dialogRef.afterClosed().subscribe(result => {
      const { permissions_tree_data } = this.store;
      this.dataSource.data = permissions_tree_data;
    });
  }

  create(f, isNew, stepper: MatStepper) {
    if (this.form.valid) {
      const { name, isAdmin, isBranchManager, isCashier, isAllCampus, isCompletedApplicationOnly, isEmbassy, isAdminMOL, isAdminMOD } = f;
      const data: IGroupUser = {
        key: this.ITEM ? this.ITEM.key : this.ds.createId(),
        status: this.ITEM ? this.ITEM.status : STATUS_OBJ.ACTIVE,
        created_at: this.ITEM ? this.ITEM.created_at : this.ds.serverTimestamp(),
        created_by: this.ITEM ? this.ITEM.created_by : this.auth.uid,
        updated_by: this.auth.uid,
        updated_at: this.ds.serverTimestamp(),
        // storeKey: STORE_KEY,
        // storeRef: this.ds.storeDocRef(STORE_KEY).ref,
        keyword: [`${name}`.trim().toLowerCase()],
        //fields
        name: `${name}`.trim(),
        isAdmin: isAdmin || false,
        isBranchManager: isBranchManager || false,
        isCashier: isCashier || false,
        isAllCampus: isAllCampus || false,
        programKeys: this.ITEM ? this.ITEM.programKeys : [],
        programs: this.ITEM ? this.ITEM.programs : [],
        isCompletedApplicationOnly: isCompletedApplicationOnly || false,
        isEmbassy: isEmbassy || false,
        isAdminMOL: isAdminMOL || false,
        isAdminMOD: isAdminMOD || false,
      }
      this.store.saveGroup(data, (success, res) => {
        if (success) {
          this.ITEM = data;
          this.data.item = data;
          this.snackBar.open(`Group has been saved successful.`, "Done", { duration: 1000 });
          stepper.next();
        } else {
          this.snackBar.open(`${res}`, "Error", { duration: 3000 });
          this.dialogRef.close()
        }
      })
    }
  }

}
