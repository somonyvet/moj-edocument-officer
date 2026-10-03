import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IPath, IFolder, IGroupUser, IShareFile } from '../interfaces/file-manager';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { statusObj, driveObj } from '../dummy/status';
import firebase from 'firebase/compat/app';
import { MONTH_DATA } from '../dummy/config';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { pushToObject, removeStingArray, pushToArray, ConvertService } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';
import { generateKeywords, renameDuplicate } from '../shared/services/mapping.service';
import { AuthStore } from './auth.store';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DatabaseService } from '../shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class FileManager {
  @observable fileManager: boolean = false;

  @observable data: any = [];
  @observable process: boolean = false;
  @observable empty: boolean = false;
  @observable loading: boolean = true;
  @observable selectedItem: any = null;
  @observable isSelectedFile: boolean = false;

  @observable totalSize: number = 0;
  @observable routeID: string = '';
  @observable selectedOpenItem: any = null;


  @observable pathData: Array<IPath> = []
  @observable fetching: boolean = false;
  @observable files: File[] = [];
  @observable fileData: any[] = [];
  @observable uploading: boolean = false;
  @observable bottomSheetRef: any;
  @observable trashMode: boolean = false;
  @observable singleData: any;
  @observable selectedUserGroup: any = null;

  uploads: any[];
  allPercentage: Observable<any>;
  myFileSubscript: any = null;
  uploadPercent: number = null;
  provinces: any[] = [];

  @observable searching: boolean = false;
  @observable searchData: any[] = [];

  constructor(
    private router: Router
    , private dialog: MatDialog
    , private _bottomSheet: MatBottomSheet
    , private storage: AngularFireStorage
    , private ds: DataService
    , private auth: AuthStore,
    private db: DatabaseService
    , private afs: AngularFirestore) { }


  @action
  subscribeFolderForm() {
    this.fetchCategoriesRef && this.fetchCategoriesRef.unsubscribe()
    this.fetchOrganizationsRef && this.fetchOrganizationsRef.unsubscribe()
    this.fetchSectorsRef && this.fetchSectorsRef.unsubscribe()
    this.fetchSignerRef && this.fetchSignerRef.unsubscribe()
  }

  fetchSignerRef: Subscription = null;
  @action
  async fetchSigner(callback: (item: any[]) => void) {
    this.fetchSignerRef && this.fetchSignerRef.unsubscribe()
    this.fetchSignerRef = this.db.officerRef(ref => ref.where('isDelete', '==', false)).valueChanges().subscribe(docs => {
      callback && callback(docs)
    })
  }

  fetchCategoriesRef: Subscription = null;
  @action
  async fetchCategories(callback: (item: any[]) => void) {
    this.fetchCategoriesRef && this.fetchCategoriesRef.unsubscribe()
    this.fetchCategoriesRef = this.db.categoryFireRef(ref => ref.where('isDelete', '==', false)).valueChanges().subscribe(docs => {
      callback && callback(docs)
    })
  }
  fetchOrganizationsRef: Subscription = null;
  @action
  async fetchOrganizations(callback: (item: any[]) => void) {
    this.fetchOrganizationsRef && this.fetchOrganizationsRef.unsubscribe()
    this.fetchOrganizationsRef = this.db.institutionFireRef(ref => ref.where('isDelete', '==', false)).valueChanges().subscribe(docs => {
      callback && callback(docs)
    })
  }

  fetchSectorsRef: Subscription = null;
  @action
  async fetchSectors(callback: (item: any[]) => void) {
    this.fetchSectorsRef && this.fetchSectorsRef.unsubscribe()
    this.fetchSectorsRef = this.db.sectorsFireRef(ref => ref.where('isDelete', '==', false)).valueChanges().subscribe(docs => {
      callback && callback(docs)
    })
  }


  @observable fetchSearchListingRef: any = null;
  @action
  fetchSearchListing(isRoot, pathData) {
    this.searching = true;
    this.fetchSearchListingRef = this.ds.folderDriveRef(isRoot, pathData, null)
      .valueChanges()
      .subscribe((docs: any[]) => {
        this.searchData = docs
        this.searching = false;
      })
  }

  @observable fetchSearchRef: any = null;
  @action
  async fetchSearch(keyword, isRoot, pathData, companyKey, callback?) {
    if (keyword && keyword.key) return;
    this.searching = true;
    this.fetchSearchRef = this.ds.fileSearchRef(keyword, pathData, isRoot, companyKey).valueChanges().subscribe(docs => {
      this.searchData = docs;
      this.searching = false;
      callback && callback(docs)
    })
  }

  @observable fetchProvincesRef: any = null;
  @action
  fetchProvinces() {
    this.fetchProvincesRef = this.ds.provincesRef()
      .valueChanges()
      .subscribe(docs => {
        this.provinces = docs;
      })
  }

  @action
  shareDocument(item: IShareFile, previousShare: any, callback) {
    this.process = true;
    const batch = this.ds.batch();
    const { pin } = item;
    if (pin) {
      batch.set(this.ds.pinFileFireRef().doc(item.key), item, { merge: true })
    }
    else {
      if (previousShare && previousShare.pin === true) {
        batch.delete(this.ds.pinFileFireRef().doc(item.key))
      }
    }
    batch.set(this.ds.publicFireRef().doc(item.key), item, { merge: true })

    // batch.update(this.ds.userFireRef().doc(item.created_by.key).collection('file_folder').doc(item.fileKey), {
    //     shareRef: this.ds.publicRef().doc(item.key).ref,
    //     sharedDate: new Date(),
    //     shared: true,
    // })

    batch.update(this.ds.folderFireRef().doc(item.fileKey), {
      shareRef: this.ds.publicRef().doc(item.key).ref,
      sharedDate: new Date(),
      shared: true,
    })
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async removeUser(item: any, group: any, callback) {
    this.process = true;
    const docsData = await this.ds.groupUserRef().doc(group.key).get().toPromise();
    const docs = pushToObject(docsData)
    const { users } = docs;
    const userData = removeStingArray(users || [], item.id);
    this.ds.groupUserRef().doc(group.key).update({
      users: userData,
      usersRef: userData.map(m => (this.ds.userRef().doc(m)).ref)
    }).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  async fetchallUserList() {
    const docsData = await this.ds.allUserListRef().get().toPromise();
    const docs = pushToArray(docsData)
    return docs;
  }



  @action
  async fetchUserList(companyKey) {
    const docsData = await this.ds.userListRef(companyKey).get().toPromise();
    const docs = pushToArray(docsData)
    return docs;
  }

  @action
  async fetchProvinceList() {
    const docsData = await this.ds.provincesRef().get().toPromise();
    const docs = pushToArray(docsData)
    return docs;
  }


  @action
  fetchPath(path: any[]) {
    if (path.length >= 5) {
      const firstPath = path.slice(0, 1);
      const lastPath = path.slice(path.length - 2, path.length);
      const middlePath = path.slice(1, path.length - 2);
      this.pathData = firstPath.map(m => ({ ...m, folder_path_button: false }));
      this.pathData = this.pathData.concat(middlePath.map(m => ({ ...m, folder_path_button: true })))
      this.pathData = this.pathData.concat(lastPath.map(m => ({ ...m, folder_path_button: false })));
      return;
    }
    this.pathData = path.map(m => ({ ...m, folder_path_button: false }));
  }

  @action
  async fetchSelectedDrive(companyKey, key) {
    const docs = await this.ds.folderRef().doc(key).get().toPromise();
    if (!docs.exists) {
      this.router.navigate([`/404`])
      return;
    }
    this.selectedOpenItem = pushToObject(docs)
    return this.selectedOpenItem;
  }


  @action
  async fetchSelectedGroup(groupKey) {
    return pushToObject(await this.ds.groupUserRef().doc(groupKey).get().toPromise())
  }

  @action
  fetchPinnedBoard(callback) {
    this.trashMode = false;
    this.loading = true;
    this.myFileSubscript = this.ds.pinnedBoardRef().valueChanges().subscribe(docs => {
      this.loading = false;
      callback(docs);
    })
  }

  @action
  fetchPublicShared(companyKey, user: any, callback?) {
    this.trashMode = false;
    this.loading = true;
    this.myFileSubscript = this.ds.publicSharedRef(companyKey, user).valueChanges().subscribe(docs => {
      this.loading = false;
      this.data = docs;
      this.fileManager = true;
      this.empty = docs.length === 0;
      callback && callback(docs);
    })
  }

  @observable fetchSharedWithOtherRef: Subscription = null;
  @action
  fetchSharedWithOther(companyKey, user: any, callback?) {
    this.trashMode = false;
    this.loading = true;
    this.fileManager = true;
    this.fetchSharedWithOtherRef && this.fetchSharedWithOtherRef.unsubscribe()
    this.fetchSharedWithOtherRef = this.ds.publicSharedWithOtherRef(companyKey, user)
      .valueChanges()
      .subscribe(docs => {
        this.data = docs;
        this.fileData = [];
        this.empty = docs.length === 0;
        this.loading = false;
        this.fileLoading = false;
        this.fileEmpty = true;
        callback && callback(docs);
      })
  }

  @observable fetchSharedWithMeRef: Subscription = null;
  @action
  fetchSharedWithMe(companyKey, user: any, selectedShared: any, path: any, callback?) {
    this.trashMode = false;
    this.loading = true;
    this.fileManager = true;
    this.fetchSharedWithMeRef && this.fetchSharedWithMeRef.unsubscribe()
    this.fetchSharedWithMeRef = this.ds.publicSharedWithMeRef(companyKey, user, selectedShared, path)
      .valueChanges().subscribe(docs => {
        this.data = docs;
        this.fileData = [];
        this.empty = docs.length === 0;
        this.loading = false;
        callback && callback(docs);
      })
  }

  @observable fetchFavoriteDataRef: Subscription = null;
  @action
  fetchFavoriteData(companyKey, user: any, callback?) {
    this.trashMode = false;
    this.loading = true;
    this.fileManager = true;
    this.fetchFavoriteDataRef && this.fetchFavoriteDataRef.unsubscribe()
    this.fetchFavoriteDataRef = this.ds.folderFileFavoriteByCompanyRef(companyKey, user.uid)
      .valueChanges().subscribe(docs => {
        this.data = docs
        this.fileList = [];
        this.empty = docs.length === 0;
        this.loading = false;
        callback && callback(this.data);
      })
  }

  @observable fetchSearchAndFilterRef: Subscription = null;
  @observable dataFilter: any[] = [];
  @action
  fetchSearchAndFilter(form: any, isRoot: boolean, callback?: (res: any[]) => void) {
    this.loading = true;
    this.fetchSearchAndFilterRef && this.fetchSearchAndFilterRef.unsubscribe()
    this.fetchDataRef = this.ds.folderDriveFilterRef(isRoot, form)
      .valueChanges()
      .subscribe((docs: any[]) => {
        this.dataFilter = docs.filter(m => m.type.key === 'folder');
        this.empty = this.dataFilter?.length === 0;
        this.loading = false;
        callback && callback(this.dataFilter);
      })
  }



  @observable fetchDataRef: Subscription = null;
  @action
  fetchData(companyKey: string, user: any, isRoot, selectedOpenItem: any, path: IPath, provinceKey, children_docs: string, callback?) {
    this.loading = true;
    this.trashMode = false;
    this.empty = false;
    this.fileManager = true;
    this.fetchDataRef && this.fetchDataRef.unsubscribe()
    this.fetchDataRef = this.ds.folderDriveRef(isRoot, path, provinceKey)
      .valueChanges()
      .subscribe((docs: any[]) => {
        this.data = docs.filter(m => m.type.key === 'folder');
        this.fileList = docs.filter(m => m.type.key === 'file');

        if (children_docs && this.fileList && this.fileList.length > 0) {
          const cArray = children_docs.split(',')
          let newArr = []
          this.fileList.map(m => {
            const valid = cArray.find(n => n === m.key) ? true : false;
            if (valid) newArr.push(m)
          })
          this.fileList = newArr
        }
        this.empty = docs.length === 0;
        this.loading = false;
        callback && callback(this.data);
      })
  }

  @observable fetchFileDataRef: any = null;
  @observable fileLoading: any = true;
  @observable fileList: any[] = [];
  @observable fileEmpty: boolean = true;

  @action
  fetchFileData(companyKey, path: IPath, isRoot, provinceKey, callback?) {
    this.fileLoading = true;
    this.fileEmpty = true;
    this.fetchFileDataRef = this.ds.fileDriveRef(companyKey, path, isRoot, provinceKey)
      .valueChanges()
      .subscribe(docs => {
        this.fileList = docs;
        this.fileEmpty = docs.length === 0;
        this.fileLoading = false;
        callback && callback(docs);
      })
  }

  @observable fetchTrashDataRef: Subscription = null;

  @action
  fetchTrashData(companyKey: string, callback?) {
    this.trashMode = true;
    this.loading = true;
    this.fetchTrashDataRef && this.fetchTrashDataRef.unsubscribe()
    this.fileManager = true;
    this.fetchTrashDataRef = this.ds.folderFileTrashByCompanyRef(companyKey)
      .valueChanges().subscribe(docs => {
        this.data = docs;
        this.fileList = [];
        this.empty = docs.length === 0;
        this.loading = false;
        callback && callback(docs)
      })
  }

  @action
  fetchCurrentFolder(key, callback) {
    this.ds.currentFolderRef(key).valueChanges().subscribe(doc => {
      // return doc;
      if (doc) {
        callback(doc)
      }
    });
  }


  @action
  fetchPinFile(key, callback) {
    this.ds.currentFolderRef(key).valueChanges().subscribe(doc => {
      // return doc;
      if (doc) {
        callback(doc)
      }
    });
  }

  @action
  clearSelected() {
    this.selectedItem = null;
  }

  @action
  addGroup(item: IGroupUser, callback) {
    this.process = true;
    this.ds.firestore().collection('group_users').doc(item.key).set(item).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  addGroupUser(user: any[], group: any, callback) {
    this.process = true;
    this.ds.firestore().collection('group_users').doc(group.key).update({
      users: user,
      usersRef: user.map(m => (this.ds.userRef().doc(m)).ref)
    }).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  @action
  addFolder(folder: IFolder, isEdit: boolean, callback) {
    this.process = true;
    const batch = this.ds.batch();

    const publicRef = this.ds.firestore().collection('file_folder');
    // const privateRef = this.ds.firestore().collection('users').doc(folder.created_by.key).collection('file_folder');
    batch.set(publicRef.doc(folder.key), folder, { merge: true })
    // batch.set(privateRef.doc(folder.key), folder, { merge: true })

    const { yearFolder, path, pathString, type, companyKey, companyRef } = folder;

    if (yearFolder && !isEdit) {
      MONTH_DATA.forEach(month => {
        const { kh } = month;
        const key = this.ds.createId();
        const { tag } = folder;
        const parentPath = {
          folder_path_button: false,
          isMyFile: true,
          key: folder.key,
          name: folder.name,
          type: type,
          path: `/my_files/${folder.key}`
        }
        const pathData = path.concat([parentPath])
        const item: IFolder = {
          key: key,
          status: statusObj.active,
          isDelete: false,
          isFavorite: false,
          isParentDelete: false,
          created_at: this.ds.serverTimestamp(),
          created_by: folder.created_by,
          updated_by: folder.updated_by,
          updated_at: this.ds.serverTimestamp(),
          deleted_by: null,
          deleted_at: null,
          date_key: ConvertService.dateKey(),
          page_key: ConvertService.toNumber(`${month.order}${ConvertService.pageKey()}`),
          keyword: ConvertService.toCapitalize(kh),
          keywords: generateKeywords([kh]),
          tag: tag.concat([month.name], [month.kh], [month.key]),
          path: pathData,
          pathString: pathString.concat([folder.key]),
          currentPath: parentPath,

          //fields
          name: kh,
          fileTag: { color: '#79b8ff' },
          personalShareRef: [],
          personalShareKey: [],
          groupRef: [],
          groupKey: [],
          companyKey: companyKey,
          companyRef: companyRef,
          type: driveObj.folder,
          allowUpload: true,
          yearFolder: false,
          folderRef: month,
          rootLevel: false,
        }

        batch.set(publicRef.doc(item.key), item, { merge: true })
        // batch.set(privateRef.doc(item.key), item, { merge: true })
      })
    }
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  RemoveShared(f: any, user: any, callback) {
    const batch = this.ds.batch();
    const publicshareRef = this.ds.firestore().collection('public_shared').doc(f.key);
    // batch.update(publicshareRef, { publicShare: false })
    batch.delete(publicshareRef)

    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  // batch.set(this.ds.publicFireRef().doc(item.key), item, { merge: true })
  // batch.update(this.ds.userFireRef().doc(item.created_by.key).collection('file_folder').doc(item.fileKey), {
  //     shareRef: this.ds.publicRef().doc(item.key).ref,
  //     sharedDate: new Date(),
  //     shared: true,
  // })

  @action
  RemoveSharedWithMe(f: any, user: any, callback) {
    const batch = this.ds.batch();
    // const pinnedShared =  ;
    // const publicShard = this.ds.firestore().collection('public_shared').doc(f.key);
    batch.set(this.ds.firestore().collection('pined_files').doc(f.key), {
      viewer: firebase.firestore.FieldValue.arrayRemove(user.key),
      user: f.user.filter(post => post.key !== user.key)
    }
      , { merge: true })
    batch.set(this.ds.firestore().collection('public_shared').doc(f.key), {
      viewer: firebase.firestore.FieldValue.arrayRemove(user.key),
      user: f.user.filter(post => post.key !== user.key)
    }
      , { merge: true })

    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })

  }

  @action
  RemovePinned(f: any, user: any, callback) {
    const batch = this.ds.batch();
    const pinnedRef = this.ds.firestore().collection('pined_files').doc(f.key);
    batch.delete(pinnedRef)

    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  StopShare(f: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.fileKey);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.fileKey);
    if (f.fileKey) {
      const pinnedRef = this.ds.firestore().collection('pined_files').doc(f.key);
      const publicshareRef = this.ds.firestore().collection('public_shared').doc(f.key);
      batch.delete(pinnedRef)
      batch.delete(publicshareRef)
    }
    batch.update(publicRef, { shared: false, shareRef: null })
    // batch.update(privateRef, { shared: false, shareRef: null });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  StopPinShare(f: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    if (f.shareRef) {
      const pinnedRef = this.ds.firestore().collection('pined_files').doc(f.shareRef.id);
      const publicshareRef = this.ds.firestore().collection('public_shared').doc(f.shareRef.id);
      batch.delete(pinnedRef)
      batch.delete(publicshareRef)
    }

    batch.update(publicRef, { shared: false, shareRef: null })
    // batch.update(privateRef, { shared: false, shareRef: null });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })

  }

  @action
  RemoveFile(f: any, user: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);

    if (f.shareRef) {
      const pinnedRef = this.ds.firestore().collection('pined_files').doc(f.shareRef.id);
      const publicshareRef = this.ds.firestore().collection('public_shared').doc(f.shareRef.id);
      batch.delete(pinnedRef)
      batch.delete(publicshareRef)
    }

    batch.update(publicRef, { isDelete: true, deleted_at: new Date(), deleted_by: user, shareRef: null, shared: false })
    // batch.update(privateRef, { isDelete: true, deleted_at: new Date(), deleted_by: user, shareRef: null, shared: false });

    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  RestoreFile(f: any, user: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    batch.update(publicRef, { isDelete: false })
    // batch.update(privateRef, { isDelete: false });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  deleteFile(filename) {
    const fileRef = this.storage.ref(filename);
    fileRef.delete()
  }

  @action
  async getFolderSize(f: any) {
    let folderSize = 0;
    let currentData = [];
    const data = await this.ds.folderByPathRef(f.key).get().toPromise();
    let docs = pushToArray(data)
    currentData = currentData.concat(docs)
    return currentData;
  }


  @action
  async DeleteForeverFile(f: any, callback) {
    const batch = this.ds.batch();
    if (f.type.key == 'file') {
      const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
      // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
      batch.delete(publicRef)
      // batch.delete(privateRef);
      batch.commit().then(() => {
        this.deleteFile(f.pathFile)
        callback(true, null);
      }).catch((error) => {
        alert(error);
        callback(false, error)
      }).finally(() => {
        this.process = false;
      })
    } else {
      let parentData: any = f;
      let currentData = [];
      let currentfile = [];
      const data = await this.ds.folderByPathRef(f.key).get().toPromise();
      const file = await this.ds.filebyPathRef(f.key).get().toPromise();
      let docs = pushToArray(data)
      let filedoc = pushToArray(file)
      currentData = currentData.concat(docs)
      currentfile = currentfile.concat(filedoc)
      if (currentData) {
        currentData = currentData.concat(parentData);
        currentData.forEach(f => {
          const publicRef = this.ds.fileFolderFireRef().doc(f.key);
          const privateRef = this.ds.userFireRef().doc(f.created_by.key).collection('file_folder').doc(f.key);
          publicRef.delete()
          privateRef.delete()
        })
      }
      if (currentfile) {
        currentfile.forEach(e => {
          this.deleteFile(e.pathFile)
        })
      }
      // batch.commit().then(() => {
      //     callback(true, null);
      // }).catch((error) => {
      //     alert(error);
      //     callback(false, error)
      // }).finally(() => {
      //     this.process = false;
      // })
    }
  }


  @action
  async EmptyTrash(callback) {
    let parentData: Array<any> = this.data;
    let currentData = [];
    const batch = this.ds.batch();
    await this.data.map(async m => {
      if (m.type.key == 'folder') {
        const data = await this.ds.folderByPathRef(m.key).get().toPromise();
        let docs = pushToArray(data)
        currentData = currentData.concat(docs)
      }
      if (currentData) {
        currentData = currentData.concat(parentData);
        currentData.forEach(f => {
          const publicRef = this.ds.fileFolderFireRef().doc(f.key);
          const privateRef = this.ds.userFireRef().doc(f.created_by.key).collection('file_folder').doc(f.key);
          publicRef.delete()
          privateRef.delete()
          if (f.type.key == 'file') {
            this.deleteFile(f.pathFile)
          }
        })
      }
    })
  }

  UpdateTag(f: any, user: any, callback) {
    this.ds.firestore().collection('file_tags').doc(f.key).update(f).then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  ChangeTagColor(f: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    batch.update(publicRef, f)
    // batch.update(privateRef, f);
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }



  @action
  async RenameFile(f: any, user: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    // const publicPath = await this.ds.firestore().collection('file_folder').where("pathString", "array-contains", f.key).get();
    // const publicCurrentPath = await this.ds.firestore().collection('file_folder').where("currentPath.key", "==", f.key).get();

    // const ca = pushToArray(publicCurrentPath)
    // if (ca.length > 0) {
    //     ca.forEach(v => {
    //         this.ds.firestore().collection('file_folder').doc(v.key)
    //             .update(
    //                 { "currentPath.name": f.name });
    //         this.ds.firestore().collection('users').doc(v.created_by.key).collection('file_folder').doc(v.key)
    //             .update(
    //                 { "currentPath.name": f.name });
    //     })
    // }
    // const folderPath = pushToArray(publicPath)
    // if (folderPath.length > 0) {
    //     folderPath.forEach(a => {
    //         const b = a.path
    //         const index = b.findIndex(x => x.key === f.key)
    //         b[index].name = f.name
    //         this.ds.firestore().collection('file_folder').doc(a.key)
    //             .set(
    //                 { path: b },
    //                 { merge: true }
    //             );
    //         this.ds.firestore().collection('users').doc(a.created_by.key).collection('file_folder').doc(a.key)
    //             .set(
    //                 { path: b },
    //                 { merge: true }
    //             );
    //     });
    // }
    batch.update(publicRef, f);
    // batch.update(privateRef, f);
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async detailCollection(collectionName: string, id, callback) {
    this.process = true;
    const data = await this.ds.settingFireRef(collectionName).doc(id).get()
    this.singleData = pushToObject(data)
    this.process = false;
    callback(this.singleData);
  }

  @action
  isFavorite(f: any, user: any, callback) {
    let favorite: boolean = f.isFavorite;
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    batch.update(publicRef, { isFavorite: true });
    // batch.update(privateRef, { isFavorite: true });
    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  unFavorite(f: any, user: any, callback) {
    const batch = this.ds.batch();

    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    batch.update(publicRef, { isFavorite: false })
    // batch.update(privateRef, { isFavorite: false });

    batch.commit().then(() => {
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  newFolder(dialogForm, folder?: any) {
    let dialogRef = this.dialog.open(dialogForm, {
      data: { FORM: folder || null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  @action
  async fetchSelectedFile(file: any, dialogForm: any, user: any, selectedCompany: any) {
    if (!user || !selectedCompany) {
      alert("internet ដំណើរការមិនសូវស្រួលសូមព្យាយាមម្ដងទៀត");
      return;
    }

    for (let i = 0; i < file.files.length; i++) {
      this.files.push(file.files.item(i));
      let { name, size, type } = file.files.item(i);
      const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
      let j = 0;
      while (size > 900) { size /= 1024; j++; };
      var exactSize = (Math.round(size * 100) / 100) + ' ' + fSExt[j];
      this.fileData.push({
        name, size: exactSize, type,
        start: false,
        finish: false,
        error: false,
        percentage: 0,
      })
    }

    file.value = null;
    this.openUploadBottomSheet(dialogForm, this.pathData, user, selectedCompany)
  }

  @action
  DeleteExistFile(f: any, callback) {
    const batch = this.ds.batch();
    const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
    // const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
    batch.delete(publicRef)
    // batch.delete(privateRef);
    batch.commit().then(() => {
      // this.deleteFile(f.pathFile)
      callback(true, null);
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }


  async openUploadBottomSheet(dialogForm, pathData: any[], user: any, selectedCompany: any): Promise<void> {
    const pt = pathData[pathData.length - 1];
    if (this.uploading) return;

    this._bottomSheet.open(dialogForm, {
      disableClose: true,
      hasBackdrop: false,
    });

    this.uploading = true;
    let currentPath: any = `my_drive/${user.key}${pt.path}`;
    let i: number = 0;
    const uploadCompleted: any[] = []
    const percentage: Observable<number>[] = [];

    for (let index = 0; index < this.files.length; index++) {
      this.fileData[index].start = true;
      this.fileData[index].finish = false;
      this.uploads = [];

      const exitFile = await this.ds.checkExistFileRef(this.files[index].name).get().toPromise();
      const duplicateName = !exitFile.empty ? (renameDuplicate(this.files[index].name || '', pushToArray(exitFile)[0].name)) : this.files[index].name
      const filename = `${duplicateName}`.trim().toLowerCase().replace(' ', '_');
      const currentPathFile = `${currentPath}/${filename}`;
      const downloadURL = await this.uploadFileToFirebase(currentPathFile, this.files[index])

      this.fileData[index].finish = true;
      this.fileData[index].start = false;

      const data = {
        filename: this.files[index].name,
        pathFile: currentPathFile,
        downloadURL: downloadURL,
        fileType: this.files[index].type,
        size: this.files[index].size,
        name: duplicateName,
      }

      const key = this.ds.createId();
      const tag = [
        key,
        this.auth.User.key,
        ConvertService.toCapitalize(`${filename}`.trim()),
        ConvertService.toDateKey(new Date()),
        `~N/A~`,
      ];

      const pathString = pathData.map(m => m.key);
      const item: IFolder = {
        key: key,
        status: statusObj.active,
        isDelete: false,
        isFavorite: false,
        isParentDelete: false,
        created_at: this.ds.serverTimestamp(),
        created_by: this.auth.User,
        updated_by: this.auth.User,
        updated_at: this.ds.serverTimestamp(),
        deleted_by: null,
        deleted_at: null,
        date_key: ConvertService.dateKey(),
        page_key: ConvertService.pageKey(),
        keyword: ConvertService.toCapitalize(filename),
        keywords: generateKeywords([filename]),
        tag: tag,
        path: pathData,
        pathString: pathString,
        currentPath: pathData[pathData.length - 1],

        name: filename,
        fileTag: [],
        personalShareRef: [],
        personalShareKey: [],
        groupRef: [],
        groupKey: [],
        companyKey: selectedCompany.key,
        companyData: {
          key: selectedCompany.key,
          name: selectedCompany.name,
          id: selectedCompany.id || selectedCompany.key,
        },
        companyRef: this.ds.companyRef().doc(selectedCompany.key).ref,
        type: driveObj.file,
        ...data,
        rootLevel: false,
      }

      this.addFolder(item, false, () => {
        uploadCompleted.push(data)
        if (uploadCompleted.length === this.fileData.length) {
          this.uploading = false;
          this.fileData = [];
          this.files = [];
          this.bottomSheetRef.dismiss();
        }
      })
    }

  }

  @action
  async uploadFileToFirebase(path: string, file: File) {
    const uploadTask = this.storage.upload(path, file)

    uploadTask.percentageChanges().subscribe((data) => {
      this.uploadPercent = data;
    });

    const downloadURL: any = (await uploadTask.then(async (f) => {
      return f.ref.getDownloadURL()
    }));

    return downloadURL
  }

  @action
  download() {
    if (this.selectedItem) {
      const { downloadURL } = this.selectedItem;
      window.open(downloadURL, "_blank")
    }
  }

  @action
  async getAllRelatedFileOrFolder(rootkey: string) {
    try {
      const foundResult0 = pushToArray(await this.afs.collection('file_folder', ref => ref.where('pathString', 'array-contains', rootkey)).get().toPromise());
      return foundResult0;
    } catch (error) {
    }
  }

  @action
  async RemoveFile0(f: any, user: any) {
    const batch = this.ds.batch();
    const publicRef = await this.ds.firestore().collection('file_folder').doc(f.key);

    batch.update(publicRef, {
      isDelete: false,
      isParentDelete: true,
      deleted_at: new Date(),
      deleted_by: user,
    });

    await batch.commit().then(async () => {
    }).catch((error) => {
    }).finally(() => {
      this.process = false;
    });

    return Promise.resolve();
  }

  @action
  async RestoreFile0(f: any, user: any) {
    const batch = this.ds.batch();
    const publicRef = await this.ds.firestore().collection('file_folder').doc(f.key);

    batch.update(publicRef, {
      isParentDelete: false,
    });

    await batch.commit().then(async () => {
    }).catch((error) => {
    }).finally(() => {
      this.process = false;
    });

    return Promise.resolve();
  }

  @action
  async resolveKeywordsInCompany() {
    try {
      const result = pushToArray(await this.afs.collection('file_folder').get().toPromise());
      chunkBatch(result, this.ds.firestore().collection('file_folder'), 300);
    } catch (error) {
    }
  }

}

async function chunkBatch(data: any[], ref: firebase.firestore.CollectionReference, limit: number) {
  let batch: firebase.firestore.WriteBatch[] = []
  const chunked = chunksArray(data, limit)
  chunked.forEach((arr, i) => {
    batch[i] = firebase.firestore().batch()
    arr.map(m => {
      batch[i].update(ref.doc(m.key), {
        isParentDelete: false,
        keyword: ConvertService.toCapitalize(m.name),
        keywords: generateKeywords([m.name])
      })
    })
  });
  for await (const [i, b] of batch.entries()) {
    await b.commit().then(() => console.log(`chunks[${i}]: resolved successful.`))
  }
}

function chunksArray(data, size) {
  const array = [...data]
  let results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};
