import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { IGroupUser } from 'src/app/interfaces/user';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { GroupsAccountStore } from '../../../stores/groups-account.store';
import { AddGroupUserAccountComponent } from '../add-group-user-account/add-group-user-account.component';
import { AddGroupUserComponent } from '../add-group-user/add-group-user.component';
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
    selector: 'app-group-user-detail',
    templateUrl: './group-user-detail.component.html',
    styleUrls: ['./group-user-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GroupUserDetailComponent implements OnInit, OnDestroy, AfterViewChecked {

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

  selectedGroup: IGroupUser = null;
  loading: boolean = false;
  constructor(
    public store: GroupsAccountStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    public changeRef: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      const { key } = params;
      if (key) {
        this.selectedGroup = key ? await this.store.fetchSelectedGroup(key) : null;
        this.store.fetchGroupMembers(key, res => {
        })
        this.store.fetchGroupPermissions(key, res => {
          const { permissions_tree_data } = this.store;
          this.dataSource.data = permissions_tree_data;
          this.loading = false;
        })
      } else {
        this.loading = false;
        this.selectedGroup = null;
      }
    })
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  async ngOnDestroy() {
    await this.store.subscribeGroup()
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
    if (!this.selectedGroup) return;
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
            this.router.navigate([`/criminal-record/applications/group-users`])
          }
          else {
            this.snackBar.open(error, 'Error')
          }
        })
      }
    });
  }

  addUser(item?: any) {
    const dialogRef = this.dialog.open(AddGroupUserAccountComponent, {
      data: { item: item, group: this.selectedGroup },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
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

}
