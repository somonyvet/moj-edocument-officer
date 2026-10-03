import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { IPath, IFolder, IGroupUser } from '../interfaces/file-manager';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { statusObj, driveObj } from '../dummy/status';
import { ConfirmOverwriteComponent } from '../modules/file-manager/components/confirm-overwrite/confirm-overwrite.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pushToObject, removeStingArray, pushToArray, ConvertService } from '../shared/services/convert.service';
import { DataService } from '../shared/services/data.service';

@Injectable()
export class Trash {
    @observable data: any = [];
    @observable process: boolean = false;
    @observable empty: boolean = false;
    @observable loading: boolean = true;
    @observable selectedItem: any = null;
    @observable totalSize: number = 0;
    @observable selectedOpenItem: any = null;


    @observable pathData: Array<IPath> = []
    @observable fetching: boolean = false;
    @observable files: File[] = [];
    @observable fileData: any[] = [];
    @observable uploading: boolean = false;
    @observable bottomSheetRef: any;
    @observable trashMode: boolean = false;
    @observable singleData: any;
    @observable selectedUserGroup:any=null;


    uploads: any[];
    allPercentage: Observable<any>;
    constructor(
         private router: Router
        , private dialog: MatDialog
        , private _bottomSheet: MatBottomSheet
        , private storage: AngularFireStorage
        , private snackBar: MatSnackBar
        , private ds: DataService) { }

    @action
    async removeUser(item: any,group:any, callback) {
        this.process=true;
        const docsData = await this.ds.groupUserRef().doc(group.key).get().toPromise();
        const docs = pushToObject(docsData)
        const {users}=docs;
        const userData=removeStingArray(users||[],item.id);
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
    async fetchUserList(companyKey) {
        const docsData = await this.ds.userListRef(companyKey).get().toPromise();
        const docs = pushToArray(docsData)
        return docs;
    }

    @action
    fetchPath(path: any[]) {
        this.pathData = path
    }

    @action
    async fetchSelectedDrive(companyKey, key) {
        const docs = await this.ds.folderRef().doc(key).get().toPromise();
        this.selectedOpenItem = pushToObject(docs)
        if (!this.selectedOpenItem) {
            this.router.navigate([`/404`])
            return;
        }
        if (this.selectedOpenItem.companyKey !== companyKey) {
            this.router.navigate([`/404`])
            return;
        }
    }

    @action
    async fetchSelectedGroup(groupKey) {
        return pushToObject(await this.ds.groupUserRef().doc(groupKey).get().toPromise())

    }


    @action
    fetchData(companyKey, user: any,isRoot, path: IPath) {
        this.data = [];
        this.trashMode = false;
        this.ds.folderByCompanyRef(companyKey, user.uid,isRoot, path,this.selectedOpenItem).valueChanges().subscribe(docs => {
            this.data = docs
            this.empty = docs.length === 0;
            this.loading = false;
        })
    }

    @action
    fetchTrashData(companyKey, user: any) {
        this.data = [];
        this.trashMode = true;
        this.ds.folderFileTrashByCompanyRef(companyKey).valueChanges().subscribe(docs => {
            this.data = docs
            this.empty = docs.length === 0;
            this.loading = false;
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
    fetchFavoriteData(companyKey, user: any) {
        this.data = [];
        this.trashMode = false;
        this.ds.folderFileFavoriteByCompanyRef(companyKey, user.uid).valueChanges().subscribe(docs => {
            this.data = docs
            this.empty = docs.length === 0;
            this.loading = false;
        })
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
    addFolder(folder: IFolder, callback) {
        this.process = true;
        const batch = this.ds.batch();
        const publicRef = this.ds.firestore().collection('file_folder').doc(folder.key);
        const privateRef = this.ds.firestore().collection('users').doc(folder.created_by.key).collection('file_folder').doc(folder.key);
        batch.set(publicRef, folder)
        batch.set(privateRef, folder)
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
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.update(publicRef, { isDelete: true, deleted_at: new Date(), deleted_by: user })
        batch.update(privateRef, { isDelete: true, deleted_at: new Date(), deleted_by: user });
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
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.update(publicRef, { isDelete: false })
        batch.update(privateRef, { isDelete: false });
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
            const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
            batch.delete(publicRef)
            batch.delete(privateRef);
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
        // let currentfile = [];
        const batch = this.ds.batch();
        await this.data.map(async m => {
            // if(m.type.key == 'file'){
            //     const file = await this.ds.filebyPathRef(m.key).get().toPromise();
            //     let docs = pushToArray(file)
            //     currentfile = currentData.concat(docs)
            // }
            if (m.type.key == 'folder') {
                const data = await this.ds.folderByPathRef(m.key).get().toPromise();
                let docs = pushToArray(data)
                currentData = currentData.concat(docs)
            }
            // if (currentfile) {
            //     currentfile.forEach(e => {
            //         this.deleteFile(e.pathFile)
            //     })
            // }
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



    @action
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
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.update(publicRef, f)
        batch.update(privateRef, f);
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

        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);

        const publicPath = await this.ds.firestore().collection('file_folder')
            .where("pathString", "array-contains", f.key).get();

        const publicCurrentPath = await this.ds.firestore().collection('file_folder')
            .where("currentPath.key", "==", f.key).get();
        const ca = pushToArray(publicCurrentPath)
        if (ca.length > 0) {
            ca.forEach(v => {
                this.ds.firestore().collection('file_folder').doc(v.key)
                    .update(
                        { "currentPath.name": f.name });
                this.ds.firestore().collection('users').doc(v.created_by.key).collection('file_folder').doc(v.key)
                    .update(
                        { "currentPath.name": f.name });
            })
        }
        const folderPath = pushToArray(publicPath)
        if (folderPath.length > 0) {
            folderPath.forEach(a => {
                const b = a.path
                const index = b.findIndex(x => x.key === f.key)
                b[index].name = f.name
                this.ds.firestore().collection('file_folder').doc(a.key)
                    .set(
                        { path: b },
                        { merge: true }
                    );
                this.ds.firestore().collection('users').doc(a.created_by.key).collection('file_folder').doc(a.key)
                    .set(
                        { path: b },
                        { merge: true }
                    );
            });
        }
        batch.update(publicRef, f);
        batch.update(privateRef, f);

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
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.update(publicRef, { isFavorite: true });
        batch.update(privateRef, { isFavorite: true });
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
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.update(publicRef, { isFavorite: false })
        batch.update(privateRef, { isFavorite: false });
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
    newFolder(dialogForm) {
        let dialogRef = this.dialog.open(dialogForm, {
            data: { FORM: null },
            panelClass: 'item-list-panel',
            role: 'dialog',
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }


    // @action
    // async fetchSelectedFile(file: any, dialogForm: any, user: any, selectedCompany: any, confirmForm) {
    //     for (let i = 0; i < file.files.length; i++) {
    //         this.files.push(file.files.item(i));
    //         let { name, size, type } = file.files.item(i);
    //         const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
    //         let j = 0;
    //         while (size > 900) { size /= 1024; j++; };
    //         var exactSize = (Math.round(size * 100) / 100) + ' ' + fSExt[j];
    //         this.fileData.push({
    //             name, size: exactSize, type,
    //             start: false,
    //             finish: false,
    //             error: false,
    //             percentage: null,
    //         })
    //     }
    //     file.value = null
    //     const filedt: any = this.fileData;
    //     let fileupload = this.fileData.map(a => a.name);
    //     const pt = this.pathData[this.pathData.length - 1]
    //     this.fileData.map(async f => {
    //         const publicRef = await this.ds.firestore().collection('file_folder').where('currentPath.key', '==', pt.key).where('name', '==', f.name).limit(1).get();
    //         const data = pushToArray(publicRef)
    //         if(!data[0]){
    //             this.openUploadBottomSheet(dialogForm, user, selectedCompany)
    //             return;
    //         }
    //         fileupload.forEach(e => {
    //             if (e == data[0].name) {
    //                 let dialogRef = this.dialog.open(ConfirmOverwriteComponent, {
    //                     data: data[0],
    //                     panelClass: 'item-list-panel',
    //                     role: 'dialog',
    //                 });
    //                 dialogRef.afterClosed().subscribe(result => {
    //                     if (result == 'yes') {
    //                         this.DeleteFile(data[0], (success) => {
    //                             if (success) {
    //                                 this.openUploadBottomSheet(dialogForm, user, selectedCompany)
    //                             } else {
    //                                 this.snackBar.open("Fail to upload file.", "Done", { duration: 3000 });
    //                             }
    //                         })
    //                     }
    //                 })
    //             }
    //         })
    //         // if (data[0]) {
    //         //     fileupload.forEach(e => {
    //         //         if (e == data[0].name) {
    //         //             let dialogRef = this.dialog.open(ConfirmOverwriteComponent, {
    //         //                 data: data[0],
    //         //                 panelClass: 'item-list-panel',
    //         //                 role: 'dialog',
    //         //             });
    //         //             dialogRef.afterClosed().subscribe(result => {
    //         //                 if (result == 'yes') {
    //         //                     this.DeleteFile(data[0], (success) => {
    //         //                         if (success) {
    //         //                             this.openUploadBottomSheet(dialogForm, user, selectedCompany)
    //         //                         } else {
    //         //                             this.snackBar.open("Fail to upload file.", "Done", { duration: 3000 });
    //         //                         }
    //         //                     })
    //         //                 }
    //         //             })
    //         //         }
    //         //     })
    //         // }
    //         // else {
    //         //     this.openUploadBottomSheet(dialogForm, user, selectedCompany)

    //         // }

    //     })

    // }



    @action
    async fetchSelectedFile(file: any, dialogForm: any, user: any, selectedCompany: any) {
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
                percentage: null,
            })
        }
        file.value = null
        this.openUploadBottomSheet(dialogForm, user, selectedCompany)

    }

    @action
    DeleteExistFile(f: any, callback) {
        const batch = this.ds.batch();
        const publicRef = this.ds.firestore().collection('file_folder').doc(f.key);
        const privateRef = this.ds.firestore().collection('users').doc(f.created_by.key).collection('file_folder').doc(f.key);
        batch.delete(publicRef)
        batch.delete(privateRef);
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


    openUploadBottomSheet(dialogForm, user: any, selectedCompany: any): void {
        const pt = this.pathData[this.pathData.length - 1]
        if (this.uploading) return;
        this._bottomSheet.open(dialogForm, {
            disableClose: true,
            hasBackdrop: false,
        });
        this.uploading = true;
        let currentPathFile: any = `${selectedCompany.name_en}/${user.key}${pt.path}`;
        const pathName = `${name}`.trim().toLowerCase().replace(' ', '_');
        currentPathFile = `${currentPathFile}${pathName}`;
        const uploadCompleted: any[] = []
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            this.fileData[i].start = true;
            this.uploads = [];
            const percentage: Observable<number>[] = [];
            const filename = file.name;
            const path = `${currentPathFile}/${filename}`;
            const task = this.storage.upload(path, file);
            const _percentage$ = task.percentageChanges();
            percentage.push(_percentage$);
            const uploadTrack = {
                fileName: filename,
                percentage: _percentage$
            }
            this.uploads.push(uploadTrack);
            this.fileData[i].percentage = _percentage$;
            const _t = task.then((f) => {
                return f.ref.getDownloadURL().then(async (url) => {
                    this.fileData[i].finish = true;
                    this.fileData[i].start = false;
                    const data = {
                        filename: filename,
                        pathFile: path,
                        downloadURL: url,
                        fileType: file.type,
                        size: file.size,
                    }
                    uploadCompleted.push(data)
                    const key = this.ds.createId();
                    const tag = [
                        key,
                        user.key,
                        ConvertService.toCapitalize(`${filename}`.trim()),
                        ConvertService.toDateKey(new Date()),
                        `~N/A~`,
                    ]

                    const pathString = this.pathData.map(m => m.key);
                    const item: IFolder = {
                      key: key,
                      status: statusObj.active,
                      isDelete: false,
                      isFavorite: false,
                      created_at: new Date(),
                      created_by: user,
                      updated_by: user,
                      updated_at: new Date(),
                      deleted_by: null,
                      deleted_at: null,
                      date_key: ConvertService.dateKey(),
                      page_key: ConvertService.pageKey(),
                      keyword: ConvertService.toCapitalize(filename),
                      tag: tag,
                      path: this.pathData,
                      pathString: pathString,
                      currentPath: this.pathData[this.pathData.length - 1],
                      //fields
                      name: filename,
                      fileTag: [],
                      personalShareRef: [],
                      personalShareKey: [],
                      groupRef: [],
                      groupKey: [],
                      companyKey: selectedCompany.key,
                      companyRef: this.ds.companyRef().doc(selectedCompany.key).ref,
                      type: driveObj.file,
                      rootLevel: false,
                      ...data,
                      isParentDelete: false,
                      keywords: []
                    }

                    const exitfile = await this.ds.firestore().collection('file_folder')
                        .where('currentPath.key', '==', item.currentPath.key)
                        .where('name', '==', item.name)
                        .where('isDelete', '==', false).limit(1).get();
                    if (exitfile.empty) {
                        this.addFolder(item, () => {
                        })
                    } else {
                        const exitfilearray = pushToArray(exitfile)
                        exitfilearray.forEach(e => {
                            if (e.name == item.name) {
                                let dialogRef = this.dialog.open(ConfirmOverwriteComponent, {
                                    data: e,
                                    panelClass: 'item-list-panel',
                                    role: 'dialog',
                                });
                                dialogRef.afterClosed().subscribe(result => {
                                    if (result == 'yes') {
                                        this.DeleteExistFile(e, (success) => {
                                            if (success) {
                                                this.addFolder(item, () => {
                                                })
                                            } else {
                                                this.snackBar.open("Fail to upload file.", "Done", { duration: 3000 });
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }


                    if (uploadCompleted.length === this.fileData.length) {
                        this.uploading = false;
                        this.fileData = [];
                        this.files = [];
                        this.bottomSheetRef.dismiss();
                    }
                })
            })
            // this.allPercentage = combineLatest(percentage)
            //     .pipe(
            //         map((percentages) => {
            //             let result = 0;
            //             for (const percentage of percentages) {
            //                 result = result + percentage;
            //             }
            //             return result / percentages.length;
            //         }),
            //     );
        }
    }

    @action
    download() {
        if (this.selectedItem) {
            const { downloadURL } = this.selectedItem;
            window.open(downloadURL, "_blank")
        }
    }

}
