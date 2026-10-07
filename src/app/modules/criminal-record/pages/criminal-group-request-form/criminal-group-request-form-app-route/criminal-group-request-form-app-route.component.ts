import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AddGroupRequestFormComponent } from '../add-group-request-form/add-group-request-form.component';

@Component({
    selector: 'app-criminal-group-request-form-app-route',
    templateUrl: './criminal-group-request-form-app-route.component.html',
    styleUrls: ['./criminal-group-request-form-app-route.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalGroupRequestFormAppRouteComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.criminal_record_approval_by_folder_tabs;
  loading: boolean = true;
  params: any = null;

  childRoute: string = 'criminal-record';
  child: any;
  subscriptionRoute: any;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    private router: Router,
    private dialog: MatDialog,
    public auth: AuthStore,
    private ps: PrintService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.loading=true;
      this.params = params;
      this.store.fetchSelectedGroupDoc(params?.id, res => {
        this.loading = false;
      });

    })
    this.router.events.subscribe(e => {
      if (this.child !== this.route.firstChild) {
        this.subscriptionRoute?.unsubscribe();
        this.child = this.route.firstChild;
        this.subscriptionRoute = this.route.firstChild.url.subscribe(x => {
          this.childRoute = x[0]?.path
        });
      }
    });
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }

  // _onSubmit() {
  //   const dialogRef = this.dialog.open(CitizenProfileCriminalFormComponent, {
  //     data: { item: null },
  //     panelClass: 'cs-dialog-wrapper',
  //     width: '580px',
  //     height: '96vh',
  //     disableClose: true,
  //     role: 'dialog',
  //   });
  //   dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  // }

  onPrint() {
    this.ps.print("#printD", "a4-2")
  }

  onEdit(item?: any) {
    const dialogRef = this.dialog.open(AddGroupRequestFormComponent, {
      data: { item: item },
      panelClass: 'cs-dialog-doc',
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      role: 'dialog',
    });
    // dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

}
