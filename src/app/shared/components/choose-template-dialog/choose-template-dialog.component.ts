import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageInfo } from 'src/app/directives/virtual-scroll-end.directive';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocTemplateStore } from 'src/app/stores/document/doc-template.store';
import { TemplateDialogSetupComponent } from '../template-dialog-setup/template-dialog-setup.component';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { chatBoxColor } from 'src/app/dummy/appinfo';

@Component({
    selector: 'app-choose-template-dialog',
    templateUrl: './choose-template-dialog.component.html',
    styleUrls: ['./choose-template-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChooseTemplateDialogComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  search: AbstractControl;
  loading: boolean = true;
  chatBoxColor: any = chatBoxColor;

  constructor(
    public dialogRef: MatDialogRef<ChooseTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public store: DocTemplateStore,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb:UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    const { currentDepartment } = this.auth;
    this.store.fetchTemplateData(currentDepartment?.key);
    this.form = this.fb.group({
      search: [null]
    })
    this.search = this.form.controls['search'];
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.store.fetchSearch(value, null, data => {
          this.loading = false;
        }))
      )
      .subscribe(res => { });
    this.loading = false;
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribe()
  }

  onSelectTemplate(item) {
    if (item) {
      this.dialogRef.close()
      this.setupTemplate(item)
    }
  }


  setupTemplate(Template) {
    const dialogRef = this.dialog.open(TemplateDialogSetupComponent, {
      data: { Template: Template, Doc: this.data },
      panelClass: 'cs-dialog-setup-wrapper',
      backdropClass: 'cs-backdrop-setup-wrapper',
      width: '168px',
      height: '168px',
      disableClose: true,
      role: 'dialog',
      autoFocus: false,
    })
    // dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }
  _onScroll(event: IPageInfo) {
    if (event.endIndex !== this.store.data.length - 1) return;
    const { currentDepartment } = this.auth;
    this.store.fetchTemplateMore(currentDepartment?.key)
  }

}
