import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs-compat';
import { AuthStore } from 'src/app/stores/auth.store';
import { MemoStore } from 'src/app/stores/document/memo.store';
import { orderBy, pushToArray, pushToObject } from '../../services/convert.service';
import { DatabaseService } from '../../services/database.service';
import { groupBy } from '../../services/mapping.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit {

  @Input() docKey : string = null;
  @Input() headerDocument : any = null;

  fetchDocRef : Subscription;
  docData : any = null;
  loading : boolean = true;

  loadingGroupSection : boolean = true;

  groupSections : any = [];
  userPermissionCompeted : any = [];

  constructor(
    private ds : DatabaseService,
    public store: MemoStore,
    public auth: AuthStore
  ) { }

  ngOnInit(): void {
    if(this.docKey!==null){
      this.ds.documentRef().doc(this.docKey).get().toPromise().then(doc=>{
        this.docData = pushToObject(doc);
        this.loading = false;
      })
      this.store.fetchDocumentSections(this.docKey, null, res => {
        this.groupSections = orderBy(groupBy(res.filter(f => f.isRejected === false), 'sectionKey'), 'page_key');
        this.loadingGroupSection = false;
      })
      this.ds.documentAccountPermissionRef(this.headerDocument.key ,ref => ref.orderBy('created_at')).get().toPromise().then(data => {
        const userPermission = orderBy(pushToArray(data).filter(m => !m.isDelete), 'profile.position.order');
        this.userPermissionCompeted = userPermission.filter(m => m?.completedTask === true)
      })
    }
  }

  gStyle(customStylesItems: Array<any>) {
    let cs = null
    const customStyles = customStylesItems && customStylesItems.length > 0 ? customStylesItems.filter(m => !m.isNormal) : []
    if (customStyles && customStyles.length > 0) {
      customStyles.map((m, index) => {
        if (index === 0) cs = `{ `
        cs += ` "${m?.code}": "${m?.value}" `
        if (index + 1 < customStyles.length) cs += ` , `
        if (index + 1 === customStyles.length) cs += ` }`
      })

      const obj = JSON.parse(cs);
      return obj
    }
  }
  
}
