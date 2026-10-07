import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { appArray, HR_FUNCTION } from 'src/app/dummy/config';
import { IGroupUser } from 'src/app/interfaces/user';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../stores/criminal.store';
import { GroupsAccountStore } from '../../stores/groups-account.store';
import { AddGroupUserComponent } from './add-group-user/add-group-user.component';


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
    selector: 'app-group-users',
    templateUrl: './group-users.component.html',
    styleUrls: ['./group-users.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GroupUsersComponent implements OnInit, OnDestroy {
  appsList = appArray;
  HR_FUNCTION = HR_FUNCTION.group;
  selectedGroup: IGroupUser = null;
  loading = true;
  queryParams: any = null;
  title = 'ក្រុមសិទ្ធិប្រើប្រាស់'

  constructor(
    public store: GroupsAccountStore,
    private ds: DataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthStore,
    public criminal: CriminalStore,
  ) { }


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
    this.criminal.newButtonName = `បង្កើតក្រុមសិទ្ធិប្រើប្រាស់`;
    this.criminal.componentDialog = AddGroupUserComponent;
    this.store.fetchGroups(async (res: any[]) => {
      this.loading = false;
    })
  }

  onSelectedApp(item) {
    // this.router.navigate([`/criminal-record/groups-account`], { queryParams: { groupId: item.key, } });
    this.router.navigate([`/criminal-record/applications/group-users/` + item.key]);
  }

  ngOnDestroy() {
    this.store.unsubscribe()
    this.store.subscribeGroups()
    this.selectedGroup = null;
  }

  create(item?: any) {
    const dialogRef = this.dialog.open(AddGroupUserComponent, {
      data: { item: item || null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  delete(item) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Group', memo: 'Group will delete from system without check with other records.', name: item.name },
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.deleteGroup(item, (success, error) => {
          if (success) {
            this.snackBar.open('Group has been deleted.', 'done', { duration: 2000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  removeMember(item) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Remove Member', memo: `Are you sure you want to remove ${item.full_name} from this group?`, remove_note: 'Member removed from the group will lose all permission until assigned to a new group.', name: item.full_name, },
      width: '680px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.store.removeGroupMember(item, (success, error) => {
          if (success) {
            this.snackBar.open('Group member has been removed.', 'Done', { duration: 3000 });
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

}
