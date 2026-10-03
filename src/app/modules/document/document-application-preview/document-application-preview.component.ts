import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmSuccessComponent } from 'src/app/shared/components/confirm-success/confirm-success.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-document-application-preview',
  templateUrl: './document-application-preview.component.html',
  styleUrls: ['./document-application-preview.component.scss']
})
export class DocumentApplicationPreviewComponent implements OnInit, OnDestroy {
  loading:boolean=true;
  constructor(public auth: AuthStore,
    public store: DocumentStore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    const { documentDataDoc } = this.store;
    this.store.fetchFileStream(documentDataDoc.key, null,res=>{
      this.loading=false;
    })
  }

  ngOnDestroy() {
    const { fetchFileStreamRef } = this.store;
    fetchFileStreamRef && fetchFileStreamRef.unsubscribe()
  }

  onReleased() {
    const { headerDocument } = this.store;
    const dialogRef = this.dialog.open(ConfirmSuccessComponent, {
      data: { title: 'បានត្រួតពិនិត្យនិងត្រឹមត្រូវ', memo: headerDocument?.documentTitle },
      panelClass: 'cs-dialog-wrapper',
      width: '680px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "yes") {
        const {config}=this.auth;
        const {administrationOffice}=config;
        this.store.saveHeaderSendTo(administrationOffice,(status, error) => {
          if (status) {
            this.snackBar.open('Document has been released.', "Done", { duration: 3000 })
          } else {
            alert(error)
          }
        })
      }
    })
  }

}
