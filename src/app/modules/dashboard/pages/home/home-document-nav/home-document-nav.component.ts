import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentFormComponent } from 'src/app/modules/document/document-form/document-form.component';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
    selector: 'app-home-document-nav',
    templateUrl: './home-document-nav.component.html',
    styleUrls: ['./home-document-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeDocumentNavComponent implements OnInit {
  selected: Date | null = new Date();
  nav_items = [
    { key: 'my-files', name: `ឯកសារខ្ញុំ`, icon: `cloudy`, url: `/edoc/documents/my-files/all`, path: `/edoc/documents/my-files` },
    { key: 'approval', name: `ត្រូវពិនិត្យឯកភាព`, icon: `file-tray-full`, url: `/edoc/documents/approval/all`, path: `/edoc/documents/approval` },
    { key: 'received-document', name: `ឯកសារចូល`, icon: `book`, url: `/edoc/documents/received-document/all`, path: `/edoc/documents/received-document` },
    { key: 'pined', name: `ឯកសារទុកចំណាំ`, icon: `pricetags`, url: `/edoc/documents/pined/all`, path: `/edoc/documents/pined` },
    { key: 'cc-files', name: `ឯកសារចេញចូល`, icon: `star`, url: `/edoc/documents/cc-files/all`, path: `/edoc/documents/cc-files` },
    { key: 'archived', name: `បិទបញ្ចប់`, icon: `archive`, url: `/edoc/documents/archived/all`, path: `/edoc/documents/archived` },
    { key: 'rejected', name: `មោឃៈ`, icon: `cloud-offline`, url: `/edoc/documents/rejected/all`, path: `/edoc/documents/rejected` },
  ]
  constructor(private route: ActivatedRoute,
    public store: MemoStore,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.firstChild.params.subscribe(params => {
      if (params) {
        this.nav_items = this.nav_items?.map(m => {
          const listKey = m?.key === params?.tabKey ? params?.docTypeKey : 'all';
          return { ...m, url: `${m?.path}/${listKey}` }
        })
      }
    })
  }

  _onCreateDoc() {
    this.dialog.open(DocumentFormComponent, {
      data: { headerDocument: null, item: null },
      role: 'dialog',
      autoFocus: false,
      panelClass: 'cs-dialog-doc',
      width: '780px',
      height: '580px',
      disableClose: true,
    })
  }

  _onSelectedCalendar(event) {
  }

  setToggle() {
    if (this.store?.toggleMainL) return {
      'max-width': 0
    }
    else return {
      'max-width': '200px'
    }
  }
}
