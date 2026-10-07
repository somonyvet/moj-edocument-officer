import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { AuthStore } from 'src/app/stores/auth.store';
import { PositionStore } from 'src/app/stores/document/position.store';
import { criminal_tabs } from '../../../dummy/criminal.dummy';
import { CriminalStore } from '../../../stores/criminal.store';
import { CriminalApplicationStore } from '../../../stores/criminalApplication.store';
import { AddGroupRequestFormComponent } from '../add-group-request-form/add-group-request-form.component';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
    selector: 'app-criminal-group-request-form-app',
    templateUrl: './criminal-group-request-form-app.component.html',
    styleUrls: ['./criminal-group-request-form-app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalGroupRequestFormAppComponent implements OnInit {
  tabs = criminal_tabs.folder_criminal;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `បញ្ជីលេខរៀង`;

  isApproved: boolean = false;
  urgent: any = null;
  STATUS_OBJ=STATUS_OBJ;

  constructor(private route: ActivatedRoute,
    public store: CriminalApplicationStore,
    private criminal: CriminalStore,
    public auth: AuthStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public ps: PositionStore,
    private ds : DataService,
  ) { }

  ngOnInit(): void {
    this.route.parent.params.subscribe(async params => {
      this.loading = true;
      this.store.fetchGroupRequestForm(res => {
        this.loading = false;
      })
      this.params = params;
    })
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    await this.store.unsubscribe()
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  scrollHandler(e) {
    if (e.endIndex !== this.store.data?.length - 1) return
    this.loadingMore = true;
    const { currentDepartment } = this.auth;
    this.store.fetchMoreCriminalRecordsForApprove(currentDepartment?.key, this.urgent, this.isApproved, res => {
      this.loadingMore = false;
    })
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
    // this.loadingSearch = true;
    // const { currentDepartment } = this.auth
    // this.store.fetchData(this.statusKey, currentDepartment?.key, value, data => {
    //       this.loadingSearch = false;
    // })
  }


  deleteGroup(item: any) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Criminal Record Folder', memo: '', name: item?.folder_no_items?.toString() },
      width: '580px',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.ps.deleteGroup(item).then(() => {
          this.snackBar.open('Criminal Record Category has been deleted.', 'done', { duration: 2000 });
          dialogRef.close('yes')
        }).catch(err => {
          alert(err)
        })
      }
    })
  }

  addGroup(item?: any) {
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

  resolve168(){
    // let data =  [];
    // let tempArr = [];
    // const tempNut = [];
    // const { serverDateTime } = this.auth;
    // this.ds.criminalRecordRef(ref=>ref.where('status.key','>=',STATUS_OBJ?.DECREE.key)).get().toPromise().then(async (res)=>{
    //   data = pushToArray(res)
    //   console.log('data',data)
    //   this.ds.groupRequestFormRef().get().toPromise().then(async res1=>{
    //     const folder = pushToArray(res1);
    //     folder.map(m=>{
    //       const nut = data.filter(f=> (new Date(f.withdraw_date?.toDate()).getDate()) === (new Date(m.release_date?.toDate()).getDate()) )
    //       if(nut.length > 0){
    //         tempArr = tempArr.concat(nut)
    //       }
    //     })
    //     console.log('tempArr',tempArr)
    //     const holidays = await this.store?.fetchHoliday(toYearKey(serverDateTime))
    //     const batch = this.ds.batch();
    //     tempArr.map(nut=>{
    //       const created_at_update = workingDay(holidays, formatFormDate(nut?.paid_at), nut?.urgent_obj?.key)
    //       const ref = this.ds.criminalRecordRef().doc(nut.key).ref
    //       batch.update(ref,{withdraw_date:created_at_update,withdraw_date_key: toDateKey(formatFormDate(created_at_update))})
    //     })
    //     batch.commit().then(()=>{
    //       console.log('done')
    //     })
    //   })
    // })

    // this.ds.criminalRecordRef(ref=>ref.where('folder_key_ref','!=',null)).get().toPromise().then(res=>{
    //   this.ds.groupRequestFormRef().get().toPromise().then(res1=>{
    //     const criminal = pushToArray(res);
    //     const folder = pushToArray(res1);
    //     const batch = this.ds.batch();
    //     folder.map(m=>{
    //       const folder_date = m.folder_date;
    //       let cri_for_folder = criminal.filter(f=>f.folder_key_ref === m.key)
    //       if(cri_for_folder.length > 0){
    //         cri_for_folder = cri_for_folder.map(m1=>{
    //           const cri_ref = this.ds.criminalRecordRef().doc(m1.key).ref
    //           batch.update(cri_ref,{
    //             apply_at: folder_date,
    //             review_at: folder_date,
    //             created_at: folder_date,
    //             date_key: toDateKey(folder_date),
    //           })
    //         })
    //       }
    //     })
    //     batch.commit().then(resCo=>{
    //       console.log('done')
    //     })
    //   })
    // })
  }

}
