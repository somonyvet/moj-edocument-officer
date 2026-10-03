import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { generateKeywords, MappingService, orderListFormat, toKeyAndName, toNameKey, toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { IChartAccount } from 'src/app/swotify/interfaces/account.interface';
import { SwotifyService } from 'src/app/swotify/services/swotify.service';
import { map, take, debounceTime } from "rxjs/operators";
import { ChartOfAccountStore } from 'src/app/swotify/stores/chartOfAccount.store';
import { ConvertService, orderBy, pushToArray, toUniq } from 'src/app/shared/services/convert.service';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';

@Component({
  selector: 'app-chart-of-account-form',
  templateUrl: './chart-of-account-form.component.html',
  styleUrls: ['./chart-of-account-form.component.scss']
})
export class ChartOfAccountFormComponent implements OnInit {
  @ViewChild('inputRef') inputRef: ElementRef;
  process: boolean = false;
  loading: boolean = true;

  form: FormGroup;
  accountType: AbstractControl;
  detailAccount: AbstractControl;
  subOfAccount: AbstractControl;
  title: any = "New account"

  filteredAccountTypeOptions: Observable<Array<any>>;
  filteredDetailTypeOptions: Observable<Array<any>>;
  filteredSubAccountOptions: Observable<Array<any>>;

  constructor(public dialogRef: MatDialogRef<ChartOfAccountFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public auth: AuthStore,
    public ds: SwotifyService,
    public store: ChartOfAccountStore,
    private snackBar: MatSnackBar,) { }

  async ngOnInit(): Promise<void> {
    const item = (this.data?.item || null) as IChartAccount;
    this.buildForm()
    const items = await this.store.fetchAccountTypes();
    this.filteredAccountTypeOptions = MappingService.autoComplete(this.accountType, items, 'name')
    if (item) {
      this.title = `Edit account`;
    }
    this.loading = false;
  }


  buildForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required], this.checkExistOnEdit()],
      accountType: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      detailAccount: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      subOfAccount: [null, [MappingService.validSelected.bind(this)]],
      description: [null],
    })
    this.accountType = this.form.controls['accountType'];
    this.detailAccount = this.form.controls['detailAccount'];
    this.subOfAccount = this.form.controls['subOfAccount'];
  }

  async _onSave(f: any): Promise<void> {
    if (this.form.valid) {
      this.form.disable()
      const { selectedCompany, uid } = this.auth;
      const { accountType, name, detailAccount, description } = f;
      const item: IChartAccount = this.data?.item || null;
      const subOfAccount = f?.subOfAccount as IChartAccount;
      let levelItem: any = 0;
      let nodeItem: any = `${orderListFormat(1)}.`
      let indexItem: any = 1;
      let parentItem: any = null;
      let pathItem: any[] = [];
      const key = item?.key || this.ds.createId();
      if (subOfAccount && item?.subOfAccount?.key !== subOfAccount?.key) {
        const parentMemberItems = pushToArray(await this.ds.chartOfAccountsRef(ref => ref.where("subOfAccount.key", "==", subOfAccount.key)).get().toPromise());
        const { level, node, path } = subOfAccount;
        const totalChild = parentMemberItems.length;
        const lastChild = MappingService.orderByDesc(parentMemberItems, "node");
        if (totalChild === 0) {
          indexItem = (toNumber(totalChild) + 1);
        } else {
          const { index } = lastChild[0];
          indexItem = toNumber(index) + 1
        }
        nodeItem = `${node}${orderListFormat(indexItem)}.`
        levelItem = level + 1;
        parentItem = node;
        pathItem = toUniq((path || []).concat([subOfAccount?.key]));
      } else {
        if (subOfAccount) {
          pathItem = toUniq((subOfAccount?.path || []).concat([subOfAccount?.key]));
        } else if (item) {
          pathItem = item?.path;
        }
        if (!item) {
          const nodeRef = await this.ds.chartOfAccountsRef(ref => ref.where('level', '==', 0)).get().toPromise();
          if (!nodeRef.empty) {
            const nodeData = orderBy(pushToArray(nodeRef), 'node')[0];
            const { index } = nodeData;
            indexItem = index + 1;
            nodeItem = `${orderListFormat(indexItem)}.`
          }
        } else {
          indexItem = item?.index;
          nodeItem = item?.node;
          levelItem = item?.level;
          parentItem = pathItem
        }
      }
      const keywords = generateKeywords([name.toLowerCase()])
      if (subOfAccount) {
        keywords.push(subOfAccount.key)
      }
      const accountKeys = (subOfAccount?.accountKeys || []).concat([key])
      const data: IChartAccount = {
        key: key,
        status: item ? (item.status || STATUS_OBJ.ACTIVE) : STATUS_OBJ.ACTIVE,
        created_at: item?.created_at || this.ds.serverTimestamp(),
        created_by: item?.created_by || uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        page_key: item?.page_key || ConvertService.pageKey(),
        keyword: keywords,
        name: name,
        order: levelItem,
        level: levelItem,
        node: nodeItem,
        parent: parentItem,
        index: indexItem,
        totalChild: item?.totalChild || 0,
        path: pathItem,
        nameKey: toNameKey(name),
        subOfAccount: subOfAccount ? toKeyAndName(subOfAccount) : null,
        company: toKeyAndName(selectedCompany) || null,
        accountKeys: accountKeys || [],
        accountType: accountType || null,
        detailAccount: detailAccount || null,
        description: description || null,
      }
      this.store.save(data).then(() => {
        this.snackBar.open(`Chart of account has been saved successful.`, "Done", { duration: 3000 });
        this.form.reset();
        this.filteredSubAccountOptions = MappingService.autoComplete(this.subOfAccount, [], 'name')
        if (this.data.req || this.data.item) {
          this.dialogRef.close(data);
        }
      }).catch(err => alert(err))
        .finally(() => {
          this.form.enable();
          this.inputRef?.nativeElement?.focus();
        })
    }
  }

  async _onSelectAccountType(event) {
    const { value } = event.option;
    this.form.patchValue({
      subOfAccount: null,
      detailAccount: null,
    })
    const items = await this.store.fetchSysDetailTypes(value.key);
    const docs = await this.store.fetchSubAccounts(value.key);
    this.filteredDetailTypeOptions = MappingService.autoComplete(this.detailAccount, items, 'name')
    this.filteredSubAccountOptions = MappingService.autoComplete(this.subOfAccount, docs, 'name')
  }

  _onSelectedDetailType(event) {
    const { value } = event.option;
    this.form.patchValue({
      subOfAccount: null,
      name: value?.name,
    })
  }


  checkExistOnEdit() {
    return (control: AbstractControl) => {
      const value = control?.value || null;
      const item = this.data?.item as IChartAccount;
      if (value) {
        return this.ds.chartOfAccountsRef(ref => ref.where('nameKey', '==', toNameKey(value))).valueChanges()
          .pipe(
            debounceTime(300),
            take(1),
            map(arr => {
              const oldValue = item ? item.nameKey : null;
              if (oldValue && oldValue === toNameKey(value)) {
                return null;
              }
              const val = arr.length > 0 ? { nameAvailable: true } : null;
              return val;
            })
          );
      }
    };
  }

}
