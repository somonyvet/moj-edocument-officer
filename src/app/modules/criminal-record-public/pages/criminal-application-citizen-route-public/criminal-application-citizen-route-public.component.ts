import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { criminal_tabs } from 'src/app/modules/criminal-record/dummy/criminal.dummy';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { PrintService } from 'src/app/shared/services/print.service';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-criminal-application-citizen-route-public',
  templateUrl: './criminal-application-citizen-route-public.component.html',
  styleUrls: ['./criminal-application-citizen-route-public.component.scss']
})
export class CriminalApplicationCitizenRoutePublicComponent implements OnInit, OnDestroy {
  tabs = criminal_tabs.criminal_record_public_tabs;
  loading: boolean = true;
  params: any = null;
  process: boolean = false;
  PENDING = STATUS_OBJ.PENDING

  backUrl : string = '/ecosystem/criminal-record/all';

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    private router: Router,
    public auth: AuthStore,
    private ps: PrintService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.params = params;
      this.store.fetchSelectedCriminalRecord(params?.id, res => {
        if (!res) {
          this.router.navigate([`/page-not-found`])
          return;
        }
        this.loading = false;
      })
    })
  }

  async ngOnDestroy(): Promise<void> {
    await this.store.subscribeSelectedCriminalRecord()
  }

  print() {
    this.ps.print("#printD", "a4")
  }

  _onDelete() {
    const { selectedCriminalRecord } = this.store;
    if (selectedCriminalRecord?.status?.key && selectedCriminalRecord?.status?.key !== this.PENDING.key) return;
    const ref = this.dialog.open(ConfirmDeleteComponent, {
      data: { title: `លុប (${selectedCriminalRecord?.fullname_header})`, memo: `តើលោកអ្នកចង់លុបសំណើរសុំព្រឹត្តិបត្រថ្កោលទោសចេញពីប្រព័ន្ធមែនទេ` },
      panelClass: 'cs-dialog-doc',
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.process = true;
        this.store.deleteCriminalRecord(selectedCriminalRecord).then(() => {
          this.snackBar.open(`សំណើរសុំព្រឹត្តិបត្រថ្កោលទោសត្រូវបានយកចេញពីប្រព័ន្ធដោយជោគជ័យ`, "រួចរាល់", { duration: 2000 });
        }).catch(err => {
          alert(err)
        }).finally(() => {
          this.process = false;
        })
      }
    })
  }

}

