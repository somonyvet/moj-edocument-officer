import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime, tap } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FILTER_USER_ACCOUNT } from 'src/app/dummy/config';
import { DataService } from 'src/app/shared/services/data.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { GroupsAccountStore } from '../../../stores/groups-account.store';
import { orderBy, pushToArray } from 'src/app/shared/services/convert.service';
import { IGroupUserMember } from 'src/app/interfaces/user';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { MappingService, mapToCountryData, mapToEmbassyData } from 'src/app/shared/services/mapping.service';
// import { OFFICER_COUNTER } from 'src/app/dummy/status';

@Component({
    selector: 'app-add-group-user-account',
    templateUrl: './add-group-user-account.component.html',
    styleUrls: ['./add-group-user-account.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddGroupUserAccountComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('inputRef', { static: true }) inputRef: ElementRef;

  form: UntypedFormGroup;
  search: AbstractControl;
  email: AbstractControl;
  option: AbstractControl;

  filterOptions = FILTER_USER_ACCOUNT;
  formFocus: boolean = false;

  subscribe: any = null;
  title = "បញ្ចូលគណនីទៅក្នុងក្រុម";

  SELECTED_EMPLOYEE: any = null;
  IS_VALID_USER: boolean = true;
  process: boolean;
  emptyPhoto = PHOTO_LIB?.EMPTY_AVATAR;

  filterEmbassy: any = []
  filterCountry: any = []

  // OFFICER_COUNTER = Object.values(OFFICER_COUNTER);

  constructor(
    public dialogRef: MatDialogRef<AddGroupUserAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public fs: DataService,
    public ds: DataService,
    public auth: AuthStore,
    public store: GroupsAccountStore,
    private snackBar: MatSnackBar,
    private changeRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {

    console.log('this.data?.group',this.data?.group)

    const { config } = this.auth;
    const item = this.data?.item || null;
    this.SELECTED_EMPLOYEE = item;
    this.form = this.fb.group({
      officer_counter: [this.data?.item?.officer_counter || 1, [Validators.required]],
      option: [this.filterOptions[0], [Validators.required]],
      search: [null, Validators.required],
      officer_type: [ this.data?.item?.officer_type || config?.criminalOfficerOptions[0], [Validators.required]],
      application_country: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      application_embassy: [null, [Validators.required, MappingService.validSelected.bind(this)]],
      print_paid_online: [this.data?.item?.print_paid_online || false],
    })

    if (this.data?.group?.key !== config?.officerVerifyCriminalApplication) {
      this.form.controls['officer_counter'].disable();
      this.form.controls['officer_type'].disable();
      if (item) {
        this.form.patchValue({
          officer_type: config?.criminalOfficerOptions?.find(m => m?.key === item?.officer_type?.key)
        })
      }
    }

    if (item) {
      this.form.controls['option'].disable();
      this.form.controls['search'].disable();
      this.title = `កែប្រែព័ត៌មាន ${item?.displayName}`

      if(item?.application_country?.key){
        let selectedEmbassy = null;
        this.filterEmbassy = await this.store?.getEmbassyByCountryKey(item?.application_country?.key)
        selectedEmbassy = this.filterEmbassy?.find(f=>f?.key === item?.application_embassy?.key)
        this.form.patchValue({
          application_country: item?.application_country || null,
          application_embassy: selectedEmbassy || null,
        })
      }
    }

    if(this.data?.group?.isEmbassy){
      this.filterCountry = await this.store.fetchFilterDropdownData('countries', null, 'en_short_name')

      this.form.get('application_country')?.valueChanges.pipe(
        debounceTime(300),
        tap(() => false),
        switchMap((value) =>
          this.store.fetchFilterDropdownData('countries', value, 'en_short_name')
        )
      )
      .subscribe((res) => {
        this.filterCountry = res;
      });

    }else{
      this.form?.get('application_country').disable()
      this.form?.get('application_embassy').disable()
    }

    this.email = this.form.controls['email'];
    this.search = this.form.controls["search"];
    this.option = this.form.controls["option"];

    const option: any = this.filterOptions[0];
    this.option.patchValue(option)
    this.store.fetchUserData(option && option.key)
    this.subscribe = this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (this.store.searching = true)),
        switchMap(value => this.store.userSearch(this.option.value && this.option.value.key, value))
      ).subscribe((results: any) => {
        this.store.searchData = orderBy(results, 'name');
        this.store.searching = false;
      })
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }


  async ngOnDestroy() {
    await this.store.subscribeUser()
    this.subscribe && this.subscribe.unsubscribe()
  }

  displayItem(item: any): string {
    return item ? item.displayName : item;
  }

  _onFocus(focus: boolean) {
    this.formFocus = focus;
  }

  async _onSelectedEmployee(event) {
    this.process = true;
    const { value } = event.option;
    const ref = await this.store?.getUserGroup(value.key);
    if (ref) {
      alert(`User is already in group ${ref.groupData.name}. Please remove user from group ${ref.groupData.name} first before add to this group!`)
      this.process = false;
      return
    }
    this.SELECTED_EMPLOYEE = value;
    this.process = false;
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      this.process = true;
      this.form.disable();
      const item = this.data?.item || null;

      const { officer_counter, option, officer_type, application_country, application_embassy, print_paid_online} = f;
      const { uid } = this.auth;
      const { selectedGroup } = this.store;
      const ref = await this.store?.getUserGroup(this.SELECTED_EMPLOYEE?.key);
      if (!item && ref) {
        alert(`User is already in group ${ref.groupData.name}. Please remove user from group ${ref.groupData.name} first before add to this group!`)
        this.process = false;
        return
      }

      const data: IGroupUserMember = {
        key: item?.key || this.SELECTED_EMPLOYEE?.key,
        created_at: this.ds.serverTimestamp(),
        created_by: uid,
        ...this.SELECTED_EMPLOYEE,
        groupData: {
          key: selectedGroup.key,
          name: selectedGroup.name,
          isAdmin: selectedGroup.isAdmin || false,
        },
        officer_counter: officer_counter || null,
        officer_type: officer_type || null,
        application_country: mapToCountryData(application_country),
        application_embassy: mapToEmbassyData(application_embassy),
        print_paid_online: print_paid_online,
      }

      if(print_paid_online){
        this.store.updateOfficersPrintPaidOnline([data?.key],[])
      }else{
        this.store.updateOfficersPrintPaidOnline([],[data?.key])
      }

      this.store.addGroupMember(data, (success, res) => {
        if (item) {
          this.dialogRef.close('yes')
          return;
        }
        this.form.enable();
        this.SELECTED_EMPLOYEE = null;
        if (success) {
          this.snackBar.open(`Group member been added successful.`, "Done", { duration: 3000 });
        }
        this.form.reset();
        this.form.patchValue({ option, officer_type: officer_type || null, officer_counter: officer_counter })
        this.process = false;
      })
    }
  }

  async optionSelectedCountry(e){
    this.filterEmbassy = [];
    if(e?.key){
      this.filterEmbassy = await this.store.getEmbassyByCountryKey(e?.key);
      if(!this.filterEmbassy?.length){
        const message = `គ្មានស្ថានទូតកម្ពុជាប្រចាំប្រទេស ${e?.en_short_name} ផ្ដល់សេវាដកព្រឹត្តិបត្រថ្កោលទោស។`
        alert(message)
      }
    }
  }


  displayItemCountry(item: any): string {
    return item ? item?.en_short_name : item;
  }

  displayEmbassy(item: any): string {
    return item ? item?.name : item;
  }

  // async batchUser(){

  //   const { uid } = this.auth;
  //   const { selectedGroup } = this.store;
  //   const name = [];

  //   Array.from(Array(30).keys()).map((m,index)=>{
  //     const i = index + 11
  //     const n="MOL0"+i;
  //     name.push(n);
  //   })

  //   let officerData = [];
  //   const chunkItems = []
  //   const chunkSize = 10;
  //   for (let i = 0; i < name.length; i += chunkSize) {
  //     const chunk = name.slice(i, i + chunkSize);
  //     chunkItems.push(chunk);
  //   }
  //   for await(let item of chunkItems){
  //     const ref = this.ds.officerCollectionRef(ref=>ref.where('officerId','in',item)).get();
  //     const data = pushToArray(await ref.toPromise());
  //     officerData = officerData.concat(data);
  //   }

  //   const tempData = [];
  //   const batch = this.ds.batch();
  //   officerData?.map(m=>{
  //     const data: IGroupUserMember = {
  //       key: m?.key,
  //       created_at: this.ds.serverTimestamp(),
  //       created_by: uid,
  //       ...m,
  //       groupData: {
  //         key: selectedGroup.key,
  //         name: selectedGroup.name,
  //         isAdmin: selectedGroup.isAdmin || false,
  //       },
  //       officer_counter:  null,
  //       officer_type:  null,
  //     }
  //     tempData.push(data);
  //     batch.set(this.ds.groupUserAccountMemberRef(data.groupData.key).doc(data.key).ref, data, { merge: true })
  //     batch.set(this.ds.groupMemberRef().doc(data.key).ref, data, { merge: true })
  //   })

  //   console.log('tempData',tempData)

  //   batch.commit().then(()=>{
  //     console.log('res')
  //   })
  // }
}
