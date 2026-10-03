import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { Subscription } from 'rxjs';
import { APPS } from 'src/app/dummy/config';
import { IComment, IHeaderInformation, IOfficer, IUpdate } from 'src/app/interfaces/document/document.interface';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { orderBy } from 'src/app/shared/services/convert.service';

@Injectable({ providedIn: 'root' })
export class HrCommentStore {

  @observable documentCommentsData: any[] = [];
  @observable documentCommentsHeaderData: any[] = [];
  @observable documentCommentsChildData: any[] = [];
  @observable process_edit: boolean = false;
  @observable process: boolean = false;

  constructor(
    private ds: DatabaseService,
    private storageService: FireStorageService,
  ) { }


  @observable fetchDocumentCommentRef: Subscription = null;
  @observable loadingComment: boolean = true;
  @action
  fetchDocumentComment(key: string, callback: (doc: any[]) => void) {
    this.fetchDocumentCommentRef && this.fetchDocumentCommentRef.unsubscribe()
    this.fetchDocumentCommentRef = this.ds.officerRef().doc(key)
      .collection('comments', ref => ref.where('status.key', '==', 1))
      .valueChanges().subscribe(data => {
        this.documentCommentsData = orderBy(data, 'created_at','desc');
        this.documentCommentsHeaderData = this.documentCommentsData.filter(f => f.isHeader === true);
        this.documentCommentsChildData = this.documentCommentsData.filter(f => f.isHeader === false);
        callback && callback(this.documentCommentsData)
        this.loadingComment = false;
      })
  }

  @action
  async onComment(key: string | null, commentData: IComment, selectedFile, callback) {
    this.process = true
    const batch = this.ds.batch();

    const fileData = await this.storageService.upload(selectedFile);
    if (fileData && fileData.length > 0) {
      commentData.files = fileData
    }
    const ref = this.ds.officerRef().doc(key).collection('comments').doc(commentData?.key).ref
    // const headerRef = commentData?.headerKey ? documentHeaderRef().doc(this.selectedDocument?.key).collection('documentComments').doc(commentData?.headerKey) : null
    //   const uploadedFiles = await uploadMultiFile(commentData.files)
    //   this.comments = this.comments.concat(commentData)
    //   commentData.files = uploadedFiles
    commentData.hasSent = true
    // if(headerRef){
    //   batch.update(headerRef,{
    //     page_key: commentData.page_key
    //   })
    // }
    batch.set(ref, commentData)
    batch.commit().then(() => {
      callback(true)
    }).catch(error => {
      callback(false)
    })
      .finally(() => {
        this.process = false
      })
  }


  @action
  async updateComment(key: string | null, commentData: IUpdate, selectedFile, callback) {
    const batch = this.ds.batch();
    this.process_edit = true;
    const fileData = await this.storageService.upload(selectedFile);
    if (commentData && commentData.files.length > 0) {
      for (let index = 0; index < fileData.length; index++) {
        commentData.files = commentData && commentData?.files ? commentData?.files.concat(fileData) : fileData;
      }
    } else {
      if (fileData && fileData.length > 0) {
        commentData.files = fileData
      }
    }
  }

  @action
  update(ref: any, item: any, callback) {
    this.process_edit = true;
    ref.doc(item?.key).update(item).then(() => {
      this.process_edit = false;
      callback(true, item)
    }).catch(error => {
      this.process_edit = false;
      callback(false, error)
    });
  }
}
