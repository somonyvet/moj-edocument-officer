import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { APPLICATION_TYPE_OBJ, NATIONALITY_APPLICAITON } from 'src/app/dummy/status';
import { MessageDialogComponent } from 'src/app/modules/criminal-record-public/components/message-dialog/message-dialog.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';

@Component({
  selector: 'app-criminal-record-form-route',
  templateUrl: './criminal-record-form-route.component.html',
  styleUrls: ['./criminal-record-form-route.component.scss']
})
export class CriminalRecordFormRouteComponent implements OnInit {
  loading: boolean = true;

  constructor(private route: ActivatedRoute,
    private criminal: CriminalStore,
    private router: Router,
    private auth: AuthStore,
    public store: CriminalApplicationStore,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // if(this.auth?.config?.disableApply){
    //   this.openMessageDialog();
    //   this.router.navigate([`/`])
    //   return;
    // }
    this.route.params.subscribe(params => {
      this.loading = true;
      this.criminal.params = params;
      this.store.selectedApplicationType = APPLICATION_TYPE_OBJ[params?.pageKey];
      this.store.selectedApplicationNationality = NATIONALITY_APPLICAITON?.find(m => m?.key === params?.natinalityKey);
      const { selectedApplicationNationality, selectedApplicationType } = this.store;
      const { publicApplication, config } = this.auth;
      this.store.isKhmerForm = selectedApplicationNationality?.key === 'khmer';
      if (!selectedApplicationNationality || !selectedApplicationType || (publicApplication && selectedApplicationType?.key !== config?.criminal_application_type?.key)) {
        this.router.navigate([`/page-not-found`])
        return;
      }
      this.loading = false;
    })
  }

  openMessageDialog(){
    const dialogRef = this.dialog.open(MessageDialogComponent,{
      width:'720px',
      height:'auto',
    })
  }

}
