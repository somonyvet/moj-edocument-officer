import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { DOCUMENT_ACTION_TYPE_OBJ, PRIORITY_OBJECT_ARR } from 'src/app/dummy/config';
import { tabs } from 'src/app/dummy/tabs';
import { DocumentApprovalComponent } from 'src/app/modules/document/document-approval/document-approval.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
  selector: 'app-daily-operations-report',
  templateUrl: './daily-operations-report.component.html',
  styleUrls: ['./daily-operations-report.component.scss']
})
export class DailyOperationsReportComponent implements OnInit {

  PRIORITY_DATA = PRIORITY_OBJECT_ARR;

  loading: boolean = true;
  loadingPermission: boolean = true;
  loadingHeader: boolean = true;

  disabledOption: boolean = false;
  userOption: any = null;
  userPermission: any = null;
  workPlaces: any[] = [];
  canRelease: boolean = false;
  canApprove: boolean = false;

  disabled: boolean = false;
  workplaces: any[] = [];
  workplacesApproved: any[] = [];
  groupSections: any[] = [];

  openSideComment: boolean = false;
  DOCUMENT_ACTION_TYPE_OBJ = DOCUMENT_ACTION_TYPE_OBJ

  tab = tabs.documentPreviewTab

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/109279-checklist.json',
  };

  isAllowRead: boolean = true;
  queryParams: any = null;
  constructor(
    public store: MemoStore,
    private route: ActivatedRoute,
    private router: Router,
    public doc: DocumentStore,
    public auth: AuthStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ps: PrintService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
    })
    this.route.params.subscribe(async params => {
      this.isAllowRead = true;
      this.openSideComment = false;
      this.loading = true;
      this.loadingHeader = true;
      this.loadingPermission = true;
      const { docKey } = params;
      this.tab = tabs.documentPreviewTab?.filter(f => f.key !== 2)
      const { uid, currentDepartment, employee, config, root } = this.auth;
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.unsubscribeSelectedDoc()
  }

  calStatus() {
    const { uid, currentDepartment } = this.auth;
    const { documentStreamOfficers } = this.store;
    const workplaces = this.store?.headerDocument?.workplaces?.filter(m => m?.requestApproved) || [];
    const headerOfficer = currentDepartment?.headerOfficer;
    const headOfWorkplace = headerOfficer?.find(m => m?.key === uid)
    const signOfDocument = documentStreamOfficers.find(m => m?.key === uid);
    this.disabled = signOfDocument ? true : false;
    this.workplacesApproved = workplaces;
    this.workplaces = this.store?.headerDocument?.workplaces?.filter(m => m?.order > 0.5);
    const doc_status = this.store?.headerDocument?.doc_status;

    if (signOfDocument) {
      this.canApprove = signOfDocument?.streamStatus?.key !== 1;
      this.canRelease = signOfDocument?.streamStatus?.key === 1;
    } else {
      this.canApprove = headOfWorkplace && workplaces.find(m => m?.key === currentDepartment?.key) ? true : false;
      switch (currentDepartment?.ranking?.order) {
        case 3:
          this.canRelease = doc_status?.key === 2 && headerOfficer && !workplaces.find(m => m?.key === currentDepartment?.key) ? true : false;
          break;
        default:
          break;
      }
    }
  }

  approvalDoc() {
    const dialogRef = this.dialog.open(DocumentApprovalComponent, {
      data: { item: this.userPermission },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  setStyleSidebar(bol: boolean) {
    if (!bol)
      return {
        right: '-500px'
      }
    else
      return {
        right: 0
      }
  }

  onEdit() {
    const { headerDocument } = this.store;
    this.router.navigate(['/edoc/form/' + headerDocument?.key + '/' + headerDocument?.workplace?.key + '/design'], { queryParams: { backUrl: JSON.stringify([this.router.url]) } })
  }

  _onDelete() {
    const { headerDocument } = this.store;
    if (headerDocument?.doc_status?.key !== 1) return;
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: false, name: headerDocument?.documentTitle, memo: `តើលោកអ្នកចង់លុបឯកសារនោះចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.doc.deleteDocument(headerDocument, this.auth.uid, (success, error) => {
          if (success) {
            this.snackBar.open(`Document has been deleted successful.`, "Done", { duration: 1000 });
          } else {
            alert(error)
          }
        })
      }
    })
  }

  async _onPinDoc() {
    const { uid } = this.auth;
    await this.store.pinAndUnpinDocument(uid, this.store.headerDocument, (success, error) => {

    })
  }

  _onPriorityChanged(status: any) {
    const { uid } = this.auth;
    const { headerDocument } = this.store;
    if (status?.key === headerDocument?.priority?.key) return;
    this.store.priorityDocument(status, uid, (success, error) => {
      if (!success) alert(error)
    })
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

  onPrint() {
    this.ps.print("#print", "a4")
  }
}
