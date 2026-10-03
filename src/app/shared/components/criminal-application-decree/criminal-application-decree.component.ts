import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { DECREE_STATUS_ARRAY, DECREE_STATUS_OBJ, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DecreeConfirmDialogComponent } from 'src/app/modules/criminal-record/components/decree-confirm-dialog/decree-confirm-dialog.component';
import { DecreeInputFormComponent } from 'src/app/modules/criminal-record/components/decree-input-form/decree-input-form.component';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { DataService } from '../../services/data.service';
import { DOCUMENT_FLOW_CATEGORY } from 'src/app/modules/criminal-record/dummy/criminal.dummy';
import { ICriminalRecord } from 'src/app/interfaces/criminal.interface';

@Component({
  selector: 'app-criminal-application-decree',
  templateUrl: './criminal-application-decree.component.html',
  styleUrls: ['./criminal-application-decree.component.scss']
})
export class CriminalApplicationDecreeComponent implements OnInit {
  lottie: AnimationOptions = {
    path: '../../../../../assets/logo/writer.json',
  };
  decree_options = DECREE_STATUS_ARRAY;
  process: boolean = false;

  constructor(
    public store: CriminalApplicationStore,
    private auth: AuthStore,
    private dialog: MatDialog,
    private ds: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

  }

  _result: any = null;
  _onSubmit(item: any) {
    this._result = item;
    const { selectedCriminalRecord, selectedCitizenProfile } = this.store;

    if (item?.key === DECREE_STATUS_OBJ.valid_decree_record.key) {
      const dialogRef = this.dialog.open(DecreeInputFormComponent, {
        data: {
          item: selectedCriminalRecord,
          status: item,
          statusCR: null
        },
        panelClass: 'cs-dialog-wrapper',
        width: '1080px',
        height: '96vh',
        disableClose: true,
        role: 'dialog',
      })
      dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
    }
    else {
      const { config } = this.auth;
      const str = `ឈ្មោះខាងលើនេះ&nbsp;<strong>(&nbsp;${selectedCriminalRecord?.last_name}&nbsp;${selectedCriminalRecord?.first_name}&nbsp;)</strong>&nbsp;`
      const memo = [config?.criminal_decree_noted?.name.slice(0, 3), str, config?.criminal_decree_noted?.name.slice(3)].join('');
      const ref = this.dialog.open(DecreeConfirmDialogComponent, {
        data: { title: 'ផ្ដល់និទ្ទេសលើពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោស', memo: memo },
        panelClass: 'cs-dialog-doc',
        width: '960px',
        disableClose: true,
        role: 'dialog',
      });
      ref.afterClosed().subscribe(async result => {

        if (result === 'yes') {
          this.process = true;
          const { config } = this.auth;
          const str_kh = `ឈ្មោះខាងលើនេះ&ensp;<strong>(&ensp;${selectedCriminalRecord?.last_name}&emsp;${selectedCriminalRecord?.first_name}&ensp;)</strong>&ensp;`
          const decree_kh = [config?.criminal_decree_noted?.name.slice(0, 3), str_kh, config?.criminal_decree_noted?.name.slice(3)].join('');
          const str_en = `The above-mentioned person&ensp;<strong>(&ensp;${selectedCriminalRecord?.last_name_en}&ensp;${selectedCriminalRecord?.first_name_en}&ensp;)</strong>&ensp;`
          const decree_en = [config?.criminal_decree_noted?.name_en.slice(0, 3), str_en, config?.criminal_decree_noted?.name_en.slice(3)].join('');
          const str_fr = `La personne précitée&ensp;<strong>(&ensp;${selectedCriminalRecord?.last_name_en}&ensp;${selectedCriminalRecord?.first_name_en}&ensp;)</strong>&ensp;`
          const decree_fr = [config?.criminal_decree_noted?.name_fr.slice(0, 3), str_fr, config?.criminal_decree_noted?.name_fr.slice(3)].join('');
          const decreeResult = {
            key: config?.criminal_decree_noted?.key || null,
            name: decree_kh,
            name_en: decree_en,
            name_fr: decree_fr,
          }

          const data: ICriminalRecord = {
            ...selectedCriminalRecord,
            decree_by: this.store?.getMappedProfile(),
            decree_at: this.ds.serverTimestamp(),
            status: STATUS_OBJ.DECREE,
            internal_status: STATUS_OBJ.DECREE,
            decree_status: item,
            decree_result: decreeResult,
            updated_by: this.store?.getMappedProfile(),
            updated_at: this.ds.serverTimestamp(),
            tran_at: this.ds.serverTimestamp(),
            tran_by: this.auth?.getMappedProfile(),
          }

          if(data?.document_flow_category?.key == DOCUMENT_FLOW_CATEGORY.digital.key){
            const { currentDepartment, employee, config, serverDateTime } = this.auth;
            let digitalFlow = await this.store.getDigitalFlowFirst();
            const currentFlowIndex = digitalFlow?.findIndex((f: any)=>f?.department?.key == currentDepartment.key) ?? -1;
            const currentFlow = currentFlowIndex > -1 ? digitalFlow[currentFlowIndex] : null;
            digitalFlow = digitalFlow?.map((m: any)=>{
              if(m?.department?.key == currentDepartment.key){
                return{
                  ...currentFlow,
                  approved_at: serverDateTime,
                  approved_by: this.auth.getMappedApprover(),
                  default_stampFile: employee?.stampFile || null,
                  default_remarkFile: employee?.signatureFile || null,
                  default_signatureFile: employee?.signatureFile || null,
                }
              }
              return {
                flowNo: m?.flowNo,
                department: m?.department,
                key: m?.key,
                category: m?.category,
              }
            })

            const workplaceKeys = digitalFlow?.map((m: any) => m?.department?.key)
            if(!currentFlow){
              alert('ពុំមានចរន្តលំហូរអនុម័តឯកសារ! សូមធ្វើការរៀបចំជាមុនសិន');
              return;
            }else{
              const nextFlow = digitalFlow?.[currentFlowIndex + 1];
              const nextDepartmentKey = nextFlow?.department?.key;
              data.request_approval_workplace_keys = nextDepartmentKey ? [nextDepartmentKey] : [];
              data.approved_officerKey= [this.auth.uid];
              data.approved_officers= [this.auth.getMappedApprover()];
              data.approved_workplaceKeys= [this.auth.currentDepartment.key];
              data.workplaces = digitalFlow;
              data.workplaceKeys = workplaceKeys;
              data.last_approved_at = this.ds.serverTimestamp();
              data.internal_status = STATUS_OBJ.PROCESSING;
            }
          }

          console.log("_onSubmit",data)

          this.store.approvedCriminal(data, selectedCitizenProfile, false).then(() => {
            this.snackBar.open(`ពាក្យស្នើសុំព្រឹត្តិបត្រថ្កោលទោសបានផ្ដល់និទ្ទេសដោយជោគជ័យ`, "ជោគជ័យ", { duration: 6000 });
            this.router.navigate(['../..'], { relativeTo: this.route })
            this.process = false;
          })
        }
      })
    }
  }
}
