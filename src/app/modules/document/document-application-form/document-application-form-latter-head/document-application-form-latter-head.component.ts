import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { orderBy } from 'src/app/shared/services/convert.service';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-application-form-latter-head',
    templateUrl: './document-application-form-latter-head.component.html',
    styleUrls: ['./document-application-form-latter-head.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationFormLatterHeadComponent implements OnInit {
  headerData: any;
  constructor(
    public store: DocumentStore,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { headerDocument } = this.store;
    const { workplaces } = headerDocument as any;
    this.headerData = orderBy(workplaces.filter(f => f.allowUsed === true && f.isWorkplace === true), 'order');
  }

  async selectionChangeHeader(ev) {
    const { value, selected } = ev.option;
    const { headerDocument } = this.store;
    const { workplaces } = headerDocument as any;
    const data = await workplaces.map(f => {
      if (f.key === value.key) {
        return {
          ...f,
          showInHeader: selected,
        }
      }
      return {
        ...f
      }
    })

    if (data) {
      this.store.updateDocumentLetterHead(headerDocument, data, (success, res) => {
        if (success) {
          this.snackBar.open(`Document latter head been saved successful.`, "Done", {
            duration: 1000,
            verticalPosition: 'bottom',
            horizontalPosition: 'end',
          });
        } else {
          alert(res)
        }
      })
    }
  }

}
