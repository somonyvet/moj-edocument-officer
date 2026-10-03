// import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { appArray } from 'src/app/core/dummy/stauts';
// import { InventoryService } from 'src/app/core/services/inventory.service';
// import { AuthStore } from 'src/app/core/stores/auth.store';
// import { CompanyStore } from 'src/app/core/stores/hr/company.store';

// interface ExampleFlatNode {
//   expandable: boolean;
//   name: string;
//   level: number;
//   node: any;
// }

// interface PermissionNode {
//   name: string;
//   key: string;
//   checked: boolean;
//   children?: PermissionNode[];
// }

// @Component({
//   selector: 'app-add-group-permission',
//   templateUrl: './add-group-permission.component.html',
//   styleUrls: ['./add-group-permission.component.scss']
// })
// export class AddGroupPermissionComponent implements OnInit {
//   @ViewChild('inputRef', { static: true }) inputRef: ElementRef;

//   title: any = "Add Permission";
//   form: FormGroup;
//   appsList = appArray;

//   constructor(
//     public dialogRef: MatDialogRef<AddGroupPermissionComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private fb: FormBuilder,
//     public store: CompanyStore,
//     private auth: AuthStore,
//     private snackBar: MatSnackBar,
//     public ds: InventoryService,
//   ) {
//     const { item } = this.data;
//     this.store.selectedNode = null;
//     this.form = this.fb.group({
//       app: [item ? item.app : appArray[0], [Validators.required]],
//     })
//     if (item) {
//       this.title = "Edit Permission";
//     }
//   }

//   async ngOnInit() {
//     const { item } = this.data;
//     await this.store.fetchModuleFunctions(item ? item.app.key : appArray[0].key)
//   }

//   async onSelectionChange(event) {
//     const { value } = event;
//     await this.store.fetchModuleFunctions(value.key)
//   }

//   onParentModule(event, node) {
//     const { checked } = event;
//     const { app } = this.form.value;
//     const { uid } = this.auth;
//     this.store.selectedNode = checked ? node : null;
//     this.store.checkChangedModule(checked, app, node, uid, (success, error) => {
//     })
//   }

//   onParentClick(node) {
//     this.store.selectedNode = node;
//   }

//   onAllModule(event) {
//     const { checked } = event;
//     const { app } = this.form.value;
//     const { uid } = this.auth;
//     this.store.checkChangedAllModule(checked, app, uid, (success, error) => {
//     })
//   }

//   onAllPermission(event) {
//     const { checked } = event;
//     const { app } = this.form.value;
//     const { uid } = this.auth;
//     this.store.checkChangedPermission(checked, app, null, uid, true, (success, error) => {
//     })
//   }

//   onChildPermission(event, node) {
//     const { checked } = event;
//     const { app } = this.form.value;
//     const { uid } = this.auth;
//     this.store.checkChangedPermission(checked, app, node, uid, false, (success, error) => {
//     })
//   }

// }
