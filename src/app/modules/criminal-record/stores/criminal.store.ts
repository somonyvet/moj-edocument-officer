import { observable, action, } from "mobx";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CriminalService } from "../services/criminal.service";
import { Router } from "@angular/router";
import { orderBy, pushToArray } from "src/app/shared/services/convert.service";
import { ICriminalFlow } from "../interfaces/interface";
import { Subscription } from "rxjs";
import { FireStorageService } from "src/app/shared/services/fireStorage.service";
import { CriminalLatterOfficerChooseNationalityComponent } from "../components/criminal-latter-officer-choose-nationality/criminal-latter-officer-choose-nationality.component";
import { CriminalLatterOfficerChooseNationalityKhmerComponent } from "../components/criminal-latter-officer-choose-nationality-khmer/criminal-latter-officer-choose-nationality-khmer.component";
import { CriminalPaymentComponent } from "../pages/criminal-payment/criminal-payment.component";
import { IHeaderMovement } from "src/app/interfaces/document/document.interface";
import { AuthService } from "src/app/auth/auth.service";
import { AuthStore } from "src/app/stores/auth.store";
import { toDepartmentNoWorkplace } from "src/app/shared/services/mapping.service";
import { STATUS_OBJ } from "src/app/dummy/appinfo";

@Injectable({ providedIn: 'root' })
export class CriminalStore {
  @observable toggleMainL: boolean = false;
  @observable module: any = null;
  @observable newButtonName: string = `បញ្ចូលពាក្យស្នើសុំ`;
  @observable newIDName: string = ``;
  @observable componentDialog: any = null;

  @observable routerCreate: string = null;
  @observable params: any = null;
  @observable firstParams: any = null;

  @observable data: any[] = [];
  @observable displayStatus: any = null;
  @observable urgent: boolean = false;
  // @observable receiveFolderTab: boolean = false;
  @observable process: boolean = false;


  constructor(
    private ds: CriminalService,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthStore,
  ) { }

  @observable fetchCriminalFlowRef: Subscription = null;
  @action
  fetchCriminalFlow(callback?: (items: any[]) => void) {
    this.fetchCriminalFlowRef?.unsubscribe()
    this.fetchCriminalFlowRef = this.ds.criminalFlowRef(ref => ref.orderBy('flowNo')).valueChanges().subscribe(docs => {
      this.data = docs;
      callback?.(this.data)
    })
  }

  @action
  async subscribeCriminalFlow() {
    this.fetchCriminalFlowRef?.unsubscribe()
    this.data = [];
    Promise.resolve()
  }

  @action
  saveFlow(item: ICriminalFlow) {
    return this.ds.criminalFlowRef().doc(item?.key).set(item, { merge: true })
  }

  @action
  saveSetting(item: any, field: string) {
    if (field === 'country_khmer') {
      return this.ds.settingsRef().set({ [field]: item, country_khmer_key: item?.key }, { merge: true })
    }
    return this.ds.settingsRef().set({ [field]: item }, { merge: true })
  }

  @action
  async fetchLatterNoSetting(key: string) {
    const doc = await this.ds.latterNoSettingRef(key).get().toPromise();
    return doc?.exists ? { ...(doc.data() as any), key } : null;
  }

  @action
  saveLatterNoSetting(key: string, item: any) {
    return this.ds.latterNoSettingRef(key).set({
      ...item,
      key,
      updated_at: this.ds.serverTimestamp(),
    }, { merge: true })
  }

  @action
  checkExist(nameKey: any, field: string) {
    return this.ds.criminalFlowRef(ref => ref.where(field, '==', nameKey));
  }


  @action
  async fetchDepartments() {
    const items = await this.ds.departmentsRef(ref => ref.orderBy('node').orderBy('order')).get().toPromise()
    return pushToArray(items)
  }

  @action
  async fetchNationality() {
    const items = await this.ds.nationalityRef(ref => ref.orderBy('nationality')).get().toPromise()
    return pushToArray(items)
  }

  @action
  async fetchDecreeNoted() {
    const items = await this.ds.decreeNotedRef(ref => ref.orderBy('created_at', 'desc')).get().toPromise()
    return pushToArray(items)
  }

  @action
  async fetchCriminalCategory() {
    const items = await this.ds.criminalRecordCategoryRef(ref => ref.orderBy('name')).get().toPromise()
    return pushToArray(items)
  }


  @action
  onCreate(item?: any) {
    if (this.routerCreate) {
      this.router.navigate([this.routerCreate])
      return;
    }
    if (this.componentDialog) {
      if (this.componentDialog === CriminalLatterOfficerChooseNationalityComponent || this.componentDialog === CriminalLatterOfficerChooseNationalityKhmerComponent) {
        this.dialog.open(this.componentDialog, {
          height: 'fit-content',
          data: { item: item || null },
          panelClass: 'cs-dialog-wrapper',
          disableClose: true,
          role: 'dialog',
        })
        return;
      }
      const dialogRef = this.dialog.open(this.componentDialog, {
        data: { item: item || null },
        panelClass: 'cs-dialog-wrapper',
        width: '580px',
        height: '96vh',
        disableClose: true,
        role: 'dialog',
      });
      dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
      return;
    }
  }

  updateFolderStatusReceiveFolder(folder,criminals, callback: (status: boolean, error: string) => void){
    this.process = true;
    const {currentDepartment} = this.auth;
    const folderData = {
      updated_at: this.ds.serverTimestamp(),
      updated_by: this.auth?.uid,
      received_folder_at: this.ds.serverTimestamp(),
      received_folder_by: this.auth?.uid,
      status: STATUS_OBJ.RECEIVE_FOLDER,
    }
    const movement: IHeaderMovement = {
      key: this.ds.createId(),
      created_at: this.ds.serverTimestamp(),
      created_by: this.auth?.uid,
      documentKey: folder?.key || "",
      profile: this.auth?.getMappedProfile(),
      workplaceKey: currentDepartment?.key,
      workplace: toDepartmentNoWorkplace(currentDepartment)
    }
    const criminal = {
      updated_at: this.ds.serverTimestamp(),
      updated_by: this.auth?.getMappedProfile(),
      received_folder_at: this.ds.serverTimestamp(),
      received_folder_by: this.auth?.getMappedProfile(),
      status: STATUS_OBJ.RECEIVE_FOLDER,
    }

    const batch = this.ds.batch()
    const movementRef = this.ds.firestore().collection("criminal_record_folder_header_movement").doc(movement?.key)
    const ref = this.ds.firestore().collection("criminal_record_folder").doc(folder?.key)
    batch.set(ref, {...folderData}, { merge: true });
    batch.set(movementRef, movement, { merge: true });

    criminals.forEach(c => {
      const criminalRef = this.ds.criminalRecordRef().doc(c?.key).ref
      batch.set(criminalRef, {...criminal}, { merge: true });
    })

    batch.commit().then(() => {
      callback(true, null)
    }).catch((error) => {
      alert("Unexpected Issue")
    }).finally(() => this.process = false);

  }

}
