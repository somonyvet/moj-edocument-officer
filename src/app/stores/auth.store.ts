import { Router } from '@angular/router';
import { observable, action, computed, } from 'mobx';
import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ConvertService, pushToArray, pushToObject } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';
import { first } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { ICompany, IUser } from '../interfaces/user';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IDepartment, IManagementLevel, IOfficer, ISettings, IUserPined } from '../interfaces/document/document.interface';
import { DatabaseService } from '../shared/services/database.service';
import { APP_NAME, STATUS_OBJ } from '../dummy/appinfo';
import { PresenceService } from '../shared/services/presence.service';
import firebase from 'firebase/compat/app';
import { pageKey, toNameKey, toNumber } from '../shared/services/mapping.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackNotificationComponent } from '../pages/snack-notification/snack-notification.component';
import { FireStorageService } from '../shared/services/fireStorage.service';
import { dataEntryMinistryProgramKeys, programArrayObj } from '../dummy/status';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  @observable APP_INFO = APP_NAME.MOJ;
  @observable logoutRoute: string = `/`;
  @observable publicApplication: boolean = false;

  @observable groupPermission: any = null;
  @observable permissionKeys: string[] = [];
  @observable dataEntryOnly: boolean = false;
  @observable dataEntryMinistry: any = null;
  @observable assistantUser: boolean = false;
  @observable laborHandler: boolean = false;
  @observable recipient: boolean = false;
  @observable officerType: any = null;

  @observable photoUrl: string = null;
  @observable canWriteDecree: boolean = false;
  @observable canReviewApplication: boolean = false;

  @observable user: User = null;
  @observable User: any = null;
  @observable uid: string = null;
  @observable token: string = null;
  @observable isLogged: boolean = false;
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable error: string = null;
  @observable root: boolean = false;
  @observable accountActive: boolean = false;

  @observable userPinedDocuments: IUserPined[] = [];
  @observable selectedCompany: ICompany = null;
  @observable currentDepartment: IDepartment = null;
  @observable managementLevels: IManagementLevel[] = [];

  @observable profile: IUser = null;
  @observable employee: IOfficer = null;
  @observable config: ISettings = null;
  @observable serverDateTime: any = null;

  @observable totalNotify: number = 0;
  @observable totalHrNotify: number = 0;
  @observable totalDocNotify: number = 0;
  @observable totalCriminalNotify: number = 0;

  @observable totalCriminalApplyNotify: number = 0;
  @observable totalCriminalMessageNotify: number = 0;

  @observable isCompany: boolean = true;
  @observable isEmbassyUser: boolean = true;

  @observable selected_application_country: any = null;
  @observable selected_application_embassy: any = null;
  @observable overseaManagement: boolean = false;

  @observable canCreateApplication: boolean = true;
  @observable canTakeFingerPrintForOnlineApplication: boolean = false;
  
  permissionChange: BehaviorSubject<any> = new BehaviorSubject(null);
  
  constructor(
    protected ds: DataService,
    protected router: Router,
    protected auth: AuthService,
    protected db: DatabaseService,
    private presence: PresenceService,
    private afMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    public storage: FireStorageService,
  ){}

  @computed
  get displayNameWithTitle(): string {
    const { title, last_name, first_name } = this.employee || ({} as IOfficer);
    const titles = (Array.isArray(title) ? title : title ? [title] : [])
      .map((m: any) => m?.name)
      .filter((m: any) => m)
      .join(' ');
    const fullName = [last_name, first_name].filter(m => m).join(' ');
    return [titles, fullName].filter(m => m).join(' ') || this.employee?.displayName || null;
  }

  @computed
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null ? true : false;
  }

  @action
  async uploadBase64(fileName: string, type: string, base64Data: string) {
    const key = 'mnkx14tnmGM9ekePHlVz'
    const file = await this.storage.uploadBase64(fileName, type, base64Data)

    // this.ds.dbRef().collection("criminal_record").doc(key).update({
    //   finger_print_file: file
    // }).then(()=>{
    //   console.log('done');
    // })
  }

  @action
  changePassword(oldPassword: any, newPassword: any, callback) {
    const user = firebase.auth().currentUser;
    this.auth
      .authRef()
      .signInWithEmailAndPassword(user.email, oldPassword)
      .then((account) => {
        account.user.updatePassword(newPassword)
          .then(() => {
            callback(true, null);
          })
          .catch((error) => {
            callback(false, error);
          });
      })
      .catch((error) => {
        callback(false, error);
      });
  }

  @action
  async onUnsubscribeCanActiveRef() {
    if (this.fetchCanActiveRef) (await this.fetchCanActiveRef)()
    Promise.resolve()
  }

  fetchCanActiveRef: Promise<firebase.Unsubscribe> | null = null;
  fetchUserProfileRef: Subscription = null;
  fetchEmployeeProfileRef: Subscription = null;

  @action
  async resoleUser() {
    const usersDocs = await this.ds.userRef().get().toPromise();
    const users = pushToArray(usersDocs);
    const batch = this.ds.batch()
    users?.map(m => {
      if (m?.criminal_record) {
        batch.set(this.ds.userRef().doc(m?.key).ref, { criminal_record: null }, { merge: true })
      }
    })
    batch.commit().then(() => {
    })
  }

  @action
  async fetchCanActive(callback: (profile: IUser) => void): Promise<void> {
    let _flag = "";
    await this.onUnsubscribeCanActiveRef();
    this.fetchCanActiveRef = this.auth.authRef().onAuthStateChanged(async user => {
      const doc = await this.db.settingsRef().get().toPromise();
      this.config = pushToObject(doc);
      this.user = user || null;
      this.uid = user?.uid || null;
      if (user && _flag !== user?.uid) {
        await this.fetchUserEnv()
      }
      this.loading = false;
      _flag = user?.uid || null;
      callback(this.profile || null)
    })
  }


  @action
  async fetchUserEnv(): Promise<void> {
    this.loading = true;
    await this.presence.setPresence("online");
    this.serverDateTime = new Date(await this.presence.getUIDStatusObject(this.uid).query.once('value').then(docVal => (docVal.val().timestamp)));
    const profile = await this.ds.userRef().doc<IUser>(this.uid).get().toPromise();
    this.profile = pushToObject(profile);
    if (!this.profile) {
      await this.signOut()
      return;
    }
    const { isAdmin } = this.profile || {};
    this.root = isAdmin || false;
    const employee: IOfficer = pushToObject(await this.db.officerRef().doc(this.uid).get().toPromise());
    this.employee = employee;
    const { status } = this.profile || {};
    this.accountActive = status?.key === STATUS_OBJ.ACTIVE.key;
    this.currentDepartment = employee?.currentDepartment || null;
    this.selectedCompany = employee?.company || null;
    let officerWorkplace = employee?.currentDepartment || null;
    let ministry: any = null;
    const configDoc = pushToObject(await this.db.settingsRef().get().toPromise())
    this.config = configDoc;
    const accessLevel = this.config?.startFromLevel;
    this.canWriteDecree = this.config?.criminal_storyboard_office?.key === this.currentDepartment?.key
    if (this.currentDepartment) {
      this.currentDepartment = {
        ...this.currentDepartment,
        workplace: accessLevel ? this.currentDepartment?.workplace : this.currentDepartment?.workplace.filter(m => m?.order >= accessLevel?.order),
        workplacePath: this.currentDepartment?.workplace || [],
      }
    }

    if (employee) {
      const { workplace, currentDepartment } = employee;
      const groupData = await this.ds.groupMemberRef().doc(employee?.key).get().toPromise();
      const groupOfEmployee = pushToObject(groupData);
      this.officerType = groupOfEmployee?.officer_type;
      const groupDoc = await this.ds.groupModulesRef().doc(groupOfEmployee?.groupData?.key).get().toPromise();
      this.groupPermission = pushToObject(groupDoc);
      this.permissionKeys = this.groupPermission?.programKeys || [];
      this.permissionChange.next(this.permissionKeys)
      this.overseaManagement = this.permissionKeys?.find(f=>f === 'overseas_management') ? true : false;
      this.recipient = this.permissionKeys?.find((m: any) => m === programArrayObj?.recipient?.key) ? true : false;
      this.laborHandler = (groupOfEmployee?.officer_type?.key === 4)
      this.assistantUser = (groupOfEmployee?.officer_type?.key === 3)
      const dataEntryMinistryKey = this.groupPermission?.programKeys?.find((m: any) => dataEntryMinistryProgramKeys.includes(m));
      this.dataEntryOnly = (this.groupPermission?.isCompletedApplicationOnly || dataEntryMinistryKey) ? true : false;
      this.dataEntryMinistry = this.dataEntryOnly ? programArrayObj[dataEntryMinistryKey] : null;
      this.isEmbassyUser = this.groupPermission?.isEmbassy;
      this.canCreateApplication = !this.isEmbassyUser;
      this.canTakeFingerPrintForOnlineApplication = groupOfEmployee?.officer_type?.key === 1;
      if(this.isEmbassyUser){
        this.selected_application_country = groupOfEmployee?.application_country;
        this.selected_application_embassy = groupOfEmployee?.application_embassy;
      }else{
        this.selected_application_country = null
        this.selected_application_embassy = null;
      }
      officerWorkplace = currentDepartment || Array.isArray(workplace) && workplace[workplace.length - 1];
    } else {
      officerWorkplace = null;
    }
    if(officerWorkplace) {
      const orgDoc = await this.db.departmentFireRef().doc(officerWorkplace.key).get().toPromise();
      this.currentDepartment = pushToObject(orgDoc);
      const accessMinistryLevel = this.config?.startFromLevel;
      // const managementLevelKeys = this.currentDepartment?.workplace?.map(m => m?.managementLevel?.key).slice(0, 10);
      // const managementData = await this.db.managementLevelFireRef(ref => ref.where('key', 'in', managementLevelKeys)).get().toPromise()
      this.managementLevels = [] //orderBy(pushToArray(managementData), "order")
      const managementLevelDisplayKeys = this.managementLevels.filter(m => m?.isWorkplace).map(m => m?.key)
      const userWorkplaces = this.currentDepartment?.workplace?.map(m => {
        if (m?.managementLevel?.order >= accessMinistryLevel?.order) {
          return { ...m, allowUsed: true }
        } else {
          return { ...m, allowUsed: false }
        }
      })
      this.currentDepartment = {
        ...this.currentDepartment,
        workplace: userWorkplaces,
        workplacePath: this.currentDepartment?.workplace || [],
        workplaceDisplayPath: (this.currentDepartment?.workplace || []).filter(m => managementLevelDisplayKeys.includes(m?.managementLevel?.key))
      }
      this.canWriteDecree = this.config?.criminal_storyboard_office?.key === this.currentDepartment?.key;
      this.canReviewApplication = (this.config?.criminal_record_support?.key === this.currentDepartment?.key);

    } else {
      this.currentDepartment = null;
    }

    if(this.selected_application_embassy){
      this.requestPermissionNotificationEmbassyUser(this.selected_application_embassy?.key)
    }else{
      this.requestPermissionNotification(this.uid, this.currentDepartment?.key ? [this.currentDepartment?.key] : [])
    }

    if (ministry) {
      const orgDoc = await this.db.companyFireRef().doc(ministry.key).get().toPromise();
      this.selectedCompany = pushToObject(orgDoc)
    }
    localStorage.setItem('user', JSON.stringify(this.user));
    // if (this.profile?.status?.key === STATUS_OBJ.PENDING.key) {
    //   this.router.navigate([`/hr/officer-application-form/${this.uid}`])
    // }
  }

  fetchUserCompanyRef: Subscription = null;
  fetchUserDepartmentRef: Subscription = null;
  fetchSettingRef: Subscription = null;
  fetchUserPinedDocRef: Subscription = null;
  fetchEmbassyRef: Subscription = null;

  @action
  changeDepartment(workplace: any, callback: (success: boolean, error: string) => void) {
    this.process = true;
    this.db.officerRef().doc(this.uid).update({
      currentDepartment: workplace,
    }).then(() => {
      callback(true, null)
      this.currentDepartment = workplace;
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  updateNotify(type: string) {
    const batch = this.ds.batch()
    switch (type) {
      case 'total_hr_notify':
        batch.set(this.db.officerRef().doc(this.uid).ref, {
          total_hr_notify_read: this.db.fireFieldValue().increment(this.totalHrNotify)
        }, { merge: true })
        break;
      case 'total_criminal_notify_read':
        batch.set(this.db.officerRef().doc(this.uid).ref, {
          total_criminal_notify_read: this.db.fireFieldValue().increment(this.totalCriminalNotify),
        }, { merge: true })
        break;
      case 'total_doc_notify':
        const totalRemain = toNumber(this.employee?.total_inbox_notify) - toNumber(this.employee?.total_inbox_notify_read);
        const totalApprovalRemain = toNumber(this.employee?.total_approval_notify) - toNumber(this.employee?.total_approval_notify_read);
        batch.set(this.db.officerRef().doc(this.uid).ref, {
          total_inbox_notify_read: this.db.fireFieldValue().increment(totalRemain),
          total_approval_notify_read: this.db.fireFieldValue().increment(totalApprovalRemain),
        }, { merge: true })
        break;
      case 'total_notify':
        batch.set(this.db.officerRef().doc(this.uid).ref, {
          total_hr_notify_read: this.db.fireFieldValue().increment(this.totalHrNotify),
          total_inbox_notify_read: this.db.fireFieldValue().increment(this.totalDocNotify),
          total_criminal_apply_read: this.db.fireFieldValue().increment(this.totalCriminalApplyNotify),
          total_criminal_message_notify_read: this.db.fireFieldValue().increment(this.totalCriminalMessageNotify),
          total_criminal_notify_read: this.db.fireFieldValue().increment(this.totalCriminalNotify),
          total_notify_criminal_read: this.db.fireFieldValue().increment(this.totalNotify),
        }, { merge: true })
        break;
      default:
        break;
    }
    batch.commit()
  }

  @action
  async fetchProfile() {
    this.fetchUserProfileRef && this.fetchUserProfileRef.unsubscribe()
    this.fetchSettingRef && this.fetchSettingRef.unsubscribe();
    this.fetchUserPinedDocRef && this.fetchUserPinedDocRef.unsubscribe();
    this.fetchEmployeeProfileRef && this.fetchEmployeeProfileRef.unsubscribe();
    this.fetchUserDepartmentRef?.unsubscribe()
    const ministry = this.employee?.company || null;

    this.fetchSettingRef = this.db.settingsRef().valueChanges().subscribe(async doc => {
      this.config = doc;
      if('2.023' !== doc?.crofficer_version){
        const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
        const keyBind = isApple
          ? 'command + shift + R'
          : 'ctrl + F5 ឬ ctrl + shift + R';
        this.snackBar.open(
          `មានការធ្វើបច្ចុប្បន្នភាពថ្មី ដើម្បីធ្វើបច្ចុប្បន្នភាព សូមចុច " ${keyBind} " \n ចំណាំ: សូមរក្សាទុកមុននឹងធ្វើបច្ចុប្បន្នភាព`,
          'បិទ',
          {
            panelClass: 'multiline-snackbar',
          }
        );
      }
      const accessLevel = this.config?.startFromLevel;
      this.canWriteDecree = this.config?.criminal_storyboard_office?.key === this.currentDepartment?.key
      if (this.currentDepartment) {
        this.currentDepartment = {
          ...this.currentDepartment,
          workplace: accessLevel ? this.currentDepartment?.workplace : this.currentDepartment?.workplace.filter(m => m?.order >= accessLevel?.order),
          workplacePath: this.currentDepartment?.workplace || [],
        }
      }
    })

    this.fetchUserProfileRef = this.ds.userRef().doc<IUser>(this.uid).valueChanges().subscribe(doc => {
      this.profile = doc;
      const { isAdmin, status } = doc || {}
      this.accountActive = status?.key === STATUS_OBJ.ACTIVE.key;
      this.root = isAdmin || false;
    })


    this.fetchEmployeeProfileRef = this.db.officerRef().doc(this.uid).valueChanges().subscribe(async employee => {
      this.employee = employee;
      let officerWorkplace = null;
      if (employee) {
        const { workplace, currentDepartment } = employee;
        officerWorkplace = currentDepartment || Array.isArray(workplace) && workplace[workplace.length - 1];
      } else {
        officerWorkplace = null;
      }
      if (officerWorkplace) {
        this.fetchUserDepartmentRef?.unsubscribe()
        this.fetchUserDepartmentRef = this.db.departmentFireRef().doc(officerWorkplace.key).valueChanges().subscribe((orgDoc: any) => {
          this.currentDepartment = orgDoc;
          //====================find badge number
          if (!this.recipient) {
            // this.totalHrNotify = (toNumber(employee?.total_hr_notify) + toNumber(this.currentDepartment?.total_hr_notify)) - toNumber(employee?.total_hr_notify_read)
            // this.totalDocNotify = (toNumber(employee?.total_inbox_notify) + toNumber(employee?.total_approval_notify)) - toNumber(employee?.total_inbox_notify_read) - toNumber(employee?.total_approval_notify_read)
            //for criminal
            // this.totalCriminalMessageNotify = (toNumber(this.currentDepartment?.total_criminal_message_notify)) - toNumber(employee?.total_criminal_message_notify_read)
            if(!this.isEmbassyUser){
              this.totalCriminalNotify = (toNumber(this.employee?.total_criminal_notify) + toNumber(this.currentDepartment?.total_criminal_notify)) - toNumber(this.employee?.total_criminal_notify_read)
              this.totalCriminalApplyNotify = (toNumber(this.currentDepartment?.total_criminal_apply)) - toNumber(this.employee?.total_criminal_apply_read)
              this.totalNotify = toNumber(this.totalCriminalNotify) + this.totalHrNotify + this.totalDocNotify + this.totalCriminalApplyNotify + this.totalCriminalMessageNotify
            }
          }else{
            const total_notify_criminal = orgDoc?.total_notify_criminal || 0
            const total_notify_criminal_read = orgDoc?.total_notify_criminal_read || 0;
            this.totalNotify = toNumber(total_notify_criminal) - toNumber(total_notify_criminal_read);
          }

          //====================find badge number
          const accessMinistryLevel = this.config?.startFromLevel;
          // const managementLevelKeys = this.currentDepartment?.workplace?.map(m => m?.managementLevel?.key).slice(0, 10);
          // const managementData = await this.db.managementLevelFireRef(ref => ref.where('key', 'in', managementLevelKeys)).get().toPromise()
          this.managementLevels = [] //orderBy(pushToArray(managementData), "order")
          const managementLevelDisplayKeys = this.managementLevels.filter(m => m?.isWorkplace).map(m => m?.key)
          const userWorkplaces = this.currentDepartment?.workplace?.map(m => {
            if (m?.managementLevel?.order >= accessMinistryLevel?.order) {
              return { ...m, allowUsed: true }
            } else {
              return { ...m, allowUsed: false }
            }
          })
          this.currentDepartment = {
            ...this.currentDepartment,
            workplace: userWorkplaces,
            workplacePath: this.currentDepartment?.workplace || [],
            workplaceDisplayPath: (this.currentDepartment?.workplace || []).filter(m => managementLevelDisplayKeys.includes(m?.managementLevel?.key))
          }
          this.canWriteDecree = this.config?.criminal_storyboard_office?.key === this.currentDepartment?.key;
          this.canReviewApplication = ( this.config?.criminal_record_support?.key === this.currentDepartment?.key );
        })
      } else {
        this.currentDepartment = null;
      }
      if(this.isEmbassyUser){
        this.fetchEmbassyRef?.unsubscribe()
        this.fetchEmbassyRef = this.db.embassyRef().doc(this.selected_application_embassy?.key).valueChanges().subscribe((orgDoc: any) => {
          const total_notify_criminal = orgDoc?.total_criminal_notify || 0
          const total_notify_criminal_read = employee?.total_notify_criminal_read || 0;
          this.totalNotify = toNumber(total_notify_criminal) - toNumber(total_notify_criminal_read);
        })
      }
    })
    if (ministry) {
      this.fetchUserCompanyRef?.unsubscribe()
      this.fetchUserCompanyRef = this.db.companyFireRef().doc(ministry.key).valueChanges().subscribe(doc => {
        this.selectedCompany = doc;
      })
    } else {
      this.selectedCompany = null;
    }

  }

  @action
  loginWithPhoneNumber(phone: string, appVerifier: any) {
    return this.auth.authRef().signInWithPhoneNumber(phone, appVerifier)
  }



  // @action
  // signInWithGoogleAccount(callback: (success: boolean, res: any) => void) {
  //   this.auth.authRef().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
  //     this.ngZone.run(async () => {
  //       if (result?.user) {
  //         await this.onSignInWithCredential(result?.user, async (user) => {
  //           callback(true, this.profile)
  //         })
  //       } else {
  //         callback(false, result)
  //       }
  //     })
  //   })
  // }

  // @action async onSignInWithCredential(user: firebase.User, callback: (user: any) => void) {
  //   this.uid = user?.uid || null;
  //   if (user) {
  //     const profile = await this.ds.userRef().doc<IUser>(this.uid).get().toPromise();
  //     this.profile = pushToObject(profile);
  //     if (profile.exists) {
  //       this.ds.userRef().doc(user?.uid).set({
  //         login_at: this.ds.serverTimestamp()
  //       }, { merge: true }).then(async () => {
  //         await this.fetchPublicUserEnv();
  //         callback(this.profile)
  //       }).catch(err => {
  //         alert(err)
  //         callback(null)
  //       })
  //     } else {
  //       this.ds.userRef().doc(user?.uid).set({
  //         key: user.uid,
  //         email: this.profile?.email || user?.email,
  //         created_at: this.profile?.created_at || this.ds.serverTimestamp(),
  //         created_by: this.profile?.created_by || user?.uid,
  //         displayName: this.profile?.displayName || user?.displayName || null,
  //         full_name: this.profile?.full_name || user?.displayName || null,
  //         phoneNumber: this.profile?.phoneNumber || user?.phoneNumber || null,
  //         status: this.profile?.status || STATUS_OBJ.ACTIVE,
  //         isPublicAccount: this.profile?.isPublicAccount || true,
  //         account_type: this.profile?.account_type || { key: 1, name: 'Public' },
  //         login_at: this.ds.serverTimestamp()
  //       }, { merge: true }).then(async () => {
  //         await this.fetchPublicUserEnv();
  //         callback(this.profile)
  //       }).catch(err => {
  //         alert(err)
  //         callback(null)
  //       })
  //     }
  //   } else {
  //     callback(this.profile)
  //   }
  // }



  @action
  async loginWithUser(user: any, callback: (status: boolean, error: string) => void) {
    this.user = user || null;
    this.uid = user?.uid || null;
    if (user) {
      await this.fetchUserEnv()
      localStorage.setItem('user', JSON.stringify(this.user));
      this.router.navigate(['/'])
      callback && callback(true, null);
    } else {
      this.error = "Invalid email and password.";
      return callback(false, null);
    }
  }

  @action
  signup(form: any, callback: (status: boolean, error: string) => void) {
    const { email, password } = form;
    const myEmail = `${toNameKey(email)}@immigration.gov.kh`;
    this.auth.authRef().createUserWithEmailAndPassword(myEmail, password).then(userCredential => {
      const { uid } = userCredential?.user;
      const user: IUser = {
        key: uid,
        status: STATUS_OBJ.PENDING,
        isDelete: false,
        created_at: this.ds.serverTimestamp(),
        created_by: uid,
        updated_by: uid,
        updated_at: this.ds.serverTimestamp(),
        date_key: ConvertService.toDateKey(new Date()),
        page_key: pageKey(),
        keyword: [email],
        full_name: email,
        displayName: email,
        email: myEmail,
        isAdmin: false,
        fromForm: true,
      }
      this.ds.userRef().doc(user.key).set(user, { merge: true }).then(() => {
        callback(true, null)
      }).catch(error => {
        callback(false, error)
      })
    }).catch(error => {
      callback(false, error)
    })
  }

  @action
  async signIn(form: any, callback: (status: boolean, error: string) => void) {
    try {
      this.process = true;
      const { email, password } = form;
      const username = `${`${email}`.trim()}@immigration.gov.kh`;
      this.auth.authRef().signInWithEmailAndPassword(username, password).then(async user => {
        this.user = user?.user || null;
        this.uid = user?.user?.uid || null;
        if (user) {
          await this.fetchUserEnv()
          localStorage.setItem('user', JSON.stringify(this.user));
          this.router.navigate(['/'])
          callback && callback(true, null);
        } else {
          this.error = "Invalid email and password.";
          return callback(false, null);
        }
      }).catch(error => {
        callback(false, error);
      }).finally(() => {
        this.process = false;
      })
    } catch (error) {
    }
  }

  @action
  async subscribe() {
    this.fetchUserProfileRef && this.fetchUserProfileRef.unsubscribe()
    this.fetchUserCompanyRef && this.fetchUserCompanyRef.unsubscribe()
    this.fetchSettingRef && this.fetchSettingRef.unsubscribe()
    this.fetchUserPinedDocRef && this.fetchUserPinedDocRef.unsubscribe()
    this.fetchEmployeeProfileRef && this.fetchEmployeeProfileRef.unsubscribe()
    this.fetchUserDepartmentRef?.unsubscribe()
    Promise.resolve()
  }

  @action
  async signOut(callback?: (status: boolean, error: string) => void) {
    await this.subscribe()
    await this.onUnsubscribeCanActiveRef()
    return this.auth.signOut().then(() => {
      this.process = false;
      localStorage.removeItem('user')
      this.router.navigate(['/login'])
      callback && callback(true, null);
      return null;
    }).catch(error => {
      this.process = false;
      callback && callback(false, error);
      return error;
    });
  }


  @action
  async fetchCurrentUser() {
    return await this.auth.authRef().authState.pipe(first()).toPromise();
  }

  @action
  async getUser() {
    const user = await this.auth.authRef().authState.pipe(first()).toPromise();
    if (!user) {
      return this.signOut(() => {
        return null;
      })
    }
    const { uid, displayName, email, phoneNumber, photoURL } = user;
    const mappedUser = {
      key: uid,
      displayName,
      email,
      phoneNumber,
      photoURL,
      uid,
    };
    this.User = mappedUser;
    return mappedUser;
  }

  @action
  resetPassword(email) {
    return this.auth.authRef().sendPasswordResetEmail(email);
  }

  @action
  setActivePlaning(item: any) {
    const batch = this.ds.batch()
    // batch.set(this.db.mmeYearFilterRef().doc(item?.key).ref, {
    //   projectStatus: PROJECT_STATUS_OBJECT.ACTIVE,
    //   updated_at: this.ds.serverTimestamp(),
    //   updated_by: this.uid,
    // }, { merge: true })
    // batch.set(this.db.settingsRef().ref, { planingKey: item.key }, { merge: true })
    return batch.commit()
  }

  @observable requestPermissionNotificationRef: any = null;
  configSuccess: MatSnackBarConfig = {
    panelClass: 'notify-success',
    horizontalPosition: 'start',
    verticalPosition: 'bottom'
  };

  getMappedProfile() {
    return {
      display_name: this.employee?.displayName || null,
      photoUrl: this.employee?.file?.downloadUrl || null,
      key: this.employee?.key,
    }
  }

  getMappedApprover() {
    return {
      display_name: this.displayNameWithTitle,
      photoUrl: this.employee?.file?.downloadUrl || null,
      key: this.employee?.key,
    }
  }


  @action
  requestPermissionNotification(uid: string, workplaceKeys: string[]) {
    this.requestPermissionNotificationRef = this.afMessaging.requestToken.subscribe(async token => {
      await this.fun.httpsCallable('subscribeToTopic')({ topic: uid, token }).toPromise()
      await this.fun.httpsCallable('subscribeToTopic')({ topic: '___PUBLIC___', token }).toPromise()
      if (workplaceKeys?.length > 0) {
        await this.fun.httpsCallable('subscribeToTopic')({ topic: workplaceKeys[0], token }).toPromise()
      }
      this.afMessaging.onMessage(payload => {
        const data = payload?.data || null;
        if (data) {
          this.snackBar.openFromComponent(SnackNotificationComponent, {
            data: data,
            duration: 10000,
            ...this.configSuccess
          });
        }
      })
    })
  }

  requestPermissionNotificationEmbassyUser(embassyKey: string){
    this.requestPermissionNotificationRef = this.afMessaging.requestToken.subscribe(async token => {
      await this.fun.httpsCallable('subscribeToTopic')({ topic: embassyKey, token }).toPromise()
      this.afMessaging.onMessage(payload => {
        const data = payload?.data || null;
        if (data) {
          this.snackBar.openFromComponent(SnackNotificationComponent, {
            data: data,
            duration: 10000,
            ...this.configSuccess
          });
        }
      })
    })
  }

  @action
  async getServerTime(){
    this.serverDateTime = new Date(await this.presence.getUIDStatusObject(this.uid).query.once('value').then(docVal => (docVal.val().timestamp)));
  }
}
