import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { CitizenProfileCriminalFormComponent } from '../citizen-profile-criminal-form/citizen-profile-criminal-form.component';

@Component({
  selector: 'app-citizen-profile-criminal-record',
  templateUrl: './citizen-profile-criminal-record.component.html',
  styleUrls: ['./citizen-profile-criminal-record.component.scss']
})
export class CitizenProfileCriminalRecordComponent implements OnInit,OnDestroy {
  tabs = criminal_tabs.criminal_record_tabs;
  loading: boolean = true;
  params: any = null;

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
      this.params = params;
      const parentParams = this.route.parent.snapshot.params;
      const { module } = this.criminal;
      this.tabs = criminal_tabs.criminal_record_tabs?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/request-latter/${parentParams?.tabKey}/${params?.id}/${m?.key}` }))
      this.store.fetchSelectedCriminalRecord(params?.id,res=>{
        if(!res){
          // this.router.navigate([`/page-not-found`])
          return;
        }
        this.loading=false;
      });
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord();
  }

  _onSubmit() {
    const dialogRef = this.dialog.open(CitizenProfileCriminalFormComponent, {
      data: { item: null },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }

  onPrint() {
    this.ps.print("#printD", "a4")
  }

}
