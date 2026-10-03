import { Injectable } from '@angular/core';
import { action, observable, } from 'mobx';
import { Subscription } from 'rxjs';
import { chatBoxColor } from 'src/app/dummy/appinfo';
import { APPS } from 'src/app/dummy/config';
import { IDepartment, IOfficer, ISettings, IUserPermission } from 'src/app/interfaces/document/document.interface';
import { orderBy, pushToArray, pushToObject } from 'src/app/shared/services/convert.service';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { MappingService } from 'src/app/shared/services/mapping.service';

@Injectable({ providedIn: 'root' })
export class DocTemplateStore {
  chatBoxColor: any = chatBoxColor;

  @observable data: IOfficer[] = [];
  @observable currentData: IOfficer = null;
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable empty: boolean = false;
  @observable lastVisible: IOfficer = null;
  @observable done: boolean = false;
  @observable fetching: boolean = false;

  @observable fetchDataRef: Subscription = null;
  //for create form selected info
  @observable workingOffices: any[] = [];
  @observable position: any[] = [];

  @observable officers: IOfficer[] = [];

  constructor(
    private ds: DatabaseService,
  ) { }
  @action
  unsubscribe(): void {
    this.fetchDataRef && this.fetchDataRef.unsubscribe();
  }

  @action
  async deleteTemplate(item, callback) {
    this.loading = true

    const sectionDoc = await this.ds.dbRef().collection("documents_template").doc(item.key).collection("sections").get().toPromise()
    const sectionData = pushToArray(sectionDoc)

    const batch = this.ds.batch()
    const ref = this.ds.firestore().collection("documents_template").doc(item.key)

    batch.delete(ref)
    if (sectionData && sectionData.length > 0) {
      sectionData.map(m => {
        batch.delete(ref.collection("sections").doc(m.key))
      })
    }

    batch.commit().then(() => {
      this.loading = false
      callback(true, null)
    }).catch(error => {
      this.loading = false
      callback(false, error)
    })
  }

  @action
  async subscribe() {
    this.fetchDataRef?.unsubscribe()
    this.data = []
    Promise.resolve()
  }

  @action
  async fetchSearch(keyword: any, workplaceKey: string, callback: (officers: any[]) => void): Promise<void> {
    if (typeof keyword === 'string') {
      const docs = await this.ds.documentTemplateRef(ref => {
        let condition = ref.where('isDelete', '==', false)
        if (keyword) {
          condition = condition.where('keyword', 'array-contains', keyword)
        }
        return condition.orderBy('documentNo').limit(APPS.size)
      }).get().toPromise();
      this.data = pushToArray(docs).map((m, index) => ({ ...m, index: index + 1, selectedChatBoxColor: this.chatBoxColor[`${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1)] || this.chatBoxColor[0], chatAvatar: `${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1) }));
      callback(this.data)
      return;
    } else {
      const docs = await this.ds.documentsTemplateRef(workplaceKey, null).get().toPromise()
      this.data = pushToArray(docs).map((m, index) => ({ ...m, index: index + 1, selectedChatBoxColor: this.chatBoxColor[`${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1)] || this.chatBoxColor[0], chatAvatar: `${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1) }));
      callback(this.data)
    }
  }

  @action
  fetchTemplateData(workplaceKey: string) {
    this.loading = true;
    this.fetchDataRef?.unsubscribe()
    this.fetchDataRef = this.ds.documentsTemplateRef(workplaceKey, null).valueChanges().subscribe((docs: any) => {
      this.data = docs.map((m, index) => ({ ...m, index: index + 1, selectedChatBoxColor: this.chatBoxColor[`${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1)] || this.chatBoxColor[0], chatAvatar: `${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1) }));
      this.loading = false;
      this.empty = docs.length === 0;
      if (docs.length >= APPS.size) {
        this.lastVisible = docs[docs.length - 1];
        this.done = false;
      } else {
        this.done = true;
        this.lastVisible = null;
      }
      this.empty = docs.length === 0;
      this.fetching = false;
    })
  }

  @action
  async fetchTemplateMore(workplaceKey): Promise<void> {
    if (!this.lastVisible || this.fetching || this.done) return;
    this.fetching = true;
    const data = await this.ds
      .documentsTemplateRef(workplaceKey, this.lastVisible)
      .get()
      .toPromise();
    const items = pushToArray(data) as any[];
    if (items.length >= APPS.size) {
      this.lastVisible = items[items.length - 1];
      this.done = false;
    } else {
      this.done = true;
      this.lastVisible = null;
    }
    this.data = this.data.concat(
      items.map((m, index) => ({ ...m, index: index + 1, selectedChatBoxColor: this.chatBoxColor[`${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1)] || this.chatBoxColor[0], chatAvatar: `${m?.documentName}`?.trim()?.toLocaleUpperCase().substring(0, 1) }))
    );
    this.fetching = false;
  }

  @action
  getCurrentData(key) {
    this.loading = true;
    this.ds.userAccountRef()
      .doc(key)
      .get()
      .toPromise()
      .then((doc) => {
        this.currentData = pushToObject(doc)
        this.loading = false;
      })
  }

  @action
  addDocumentTemplate(data, Template, sections: any[], callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    // const headerRef = this.ds.documentHeaderRef().doc(data.key).ref
    const ref = this.ds.documentRef().doc(data.key).ref;
    sections.map(m => {
      batch.set(ref.collection('sections').doc(m.key), m, { merge: true })
    })

    const { header, footer, title } = Template;

    const item = {
      header: header ?? [],
      footer: footer ?? [],
      title: title ?? null,
    }

    batch.update(ref, item)
    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async addOldContent(headerDoc, callback: (status: boolean, error: string) => void) {
    const batch = this.ds.batch();
    const ref = this.ds.documentRef().doc(headerDoc.key).ref;

    const { doc_parent } = headerDoc;
    const template = pushToObject(await this.ds.dbRef().collection("documents").doc(doc_parent).get().toPromise());
    let templateSection = pushToArray(await this.ds.dbRef().collection("documents").doc(doc_parent).collection('sections').get().toPromise());
    templateSection = templateSection.filter(m => m.type && m.type.key !== 8)

    const headerData = templateSection.filter(m => m.isHeader === true)
    const detailData = templateSection.filter(m => m.isHeader === false)
    let newArray = []
    headerData.map(m => {
      const headerDetail = detailData.filter(d => d.sectionKey === m.key)

      const newHeaderKey = this.ds.createId()
      const newHeader = {
        ...m,
        sectionKey: newHeaderKey,
        key: newHeaderKey,
        id: newHeaderKey,
      }

      newArray.push(newHeader)

      if (headerDetail && headerDetail.length > 0) {

        headerDetail.map(hd => {
          const { office } = hd
          const hdData = {
            ...hd,
            sectionKey: newHeaderKey,
            id: `${newHeaderKey}_${office.key}`,
            key: `${newHeaderKey}_${office.key}`
          }

          newArray.push(hdData)
        })
      }
    })

    const { header, footer, title } = template;

    const newFooter = footer.map(m => {
      return {
        ...m,
        approvedByCenterBox: null,
        approvedByLeftBox: null,
        approvedByRightBox: null,
      }
    })

    const item = {
      header: header ?? [],
      footer: newFooter ?? [],
      title: title ?? null,
    }

    newArray.forEach(m => {
      batch.set(ref.collection("sections").doc(m.key), m, { merge: true })
    })

    batch.update(ref, item)

    batch.commit().then(() => {
      callback(true, null)
    }).catch(error => {
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

}
