import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DatabaseService } from '../../services/database.service';
import { transformImageSameTokenNo } from '../../services/fireStorage.service';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss']
})
export class DocumentCardComponent implements OnInit, OnDestroy {
  @Input() item: IHeaderInformation;
  @Input() preview: boolean;
  @Input() uid: string;

  img = "../../../../../../assets/images/doc-cover.jpg";
  statistic: any = null;
  constructor(private ds: DatabaseService,
    private store: DocumentStore,
    public auth: AuthStore) { }

  subscribeDocumentRef: Subscription = null;
  subscribeDocumentStatisticRef: Subscription = null;
  link: string = '';
  isReport: boolean = false;

  ngOnInit(): void {
    this.link = `/document/${this.item?.key}`;
    const receivedWorkplaceKeys = this.item?.receivedWorkplaceKeys || [];
    if (this.preview || receivedWorkplaceKeys.find(m => m === this.uid)) {
      this.isReport = true;
      this.link = `/document/preview/${this.item?.key}/${this.item?.workplace?.key}/1/design`;
    } else {
      this.isReport = false;
    }

    this.subscribeDocumentRef = this.ds.headerDocumentRef().doc(this.item?.key).valueChanges().subscribe(doc => {
      this.item = doc ? { ...doc, coverFile: doc.coverFile ? { ...doc.coverFile, downloadURL: transformImageSameTokenNo(doc.coverFile?.downloadURL, '400').uri } : null } : null;
      if (this.preview || receivedWorkplaceKeys.find(m => m === this.uid)) {
        this.isReport = true;
      } else {
        this.isReport = false;
      }
    })
    this.subscribeDocumentStatisticRef = this.ds.documentStatisticRef().doc(this.item?.key).valueChanges().subscribe(doc => {
      this.statistic = doc;
    })
  }

  ngOnDestroy() {
    this.subscribeDocumentRef && this.subscribeDocumentRef.unsubscribe()
    this.subscribeDocumentStatisticRef && this.subscribeDocumentStatisticRef.unsubscribe()
  }


  async _onPinDoc(item: IHeaderInformation) {
    const { uid } = this.auth;
    await this.store.pinAndUnpinDocument(uid, item, (success, error) => {

    })
  }

}
