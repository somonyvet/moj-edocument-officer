import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ANNUAL_PROJECT_COLUMNS, PROJECT_STATUS_OBJECT } from 'src/app/dummy/appinfo';
import { IQuarter } from 'src/app/interfaces/document/document.interface';
import { IProjectProgram } from 'src/app/interfaces/mme';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { ProjectStore } from 'src/app/stores/project/project.store';
import { AnnualProjectDetailCommentComponent } from '../../components/annual-project-detail-comment/annual-project-detail-comment.component';
import { AnnualProjectPlaningFormComponent } from '../annual-project-planing-form/annual-project-planing-form.component';

@Component({
  selector: 'app-annual-project-planing',
  templateUrl: './annual-project-planing.component.html',
  styleUrls: ['./annual-project-planing.component.scss']
})
export class AnnualProjectPlaningComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  PROJECT_STATUS_OBJECT = PROJECT_STATUS_OBJECT;
  ANNUAL_PROJECT_COLUMNS = ANNUAL_PROJECT_COLUMNS;
  queryParams: any = null;
  currentQuarter : IQuarter = null;

  constructor(public store: ProjectStore,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      const { selectedPlaning, currentQuater } = this.store;
      this.currentQuarter = currentQuater;
      this.store.fetchProjectProgramsActivitiesAndPlaning(selectedPlaning?.key, queryParams?.activityKey, currentQuater?.key, res => {
        this.loading = false;
      })
    })
  }

  ngOnDestroy(): void {
    const { fetchProjectProgramsActivitiesRef,projectProgramLatestRef } = this.store;
    fetchProjectProgramsActivitiesRef?.unsubscribe()
    projectProgramLatestRef?.unsubscribe()
  }

  _addPlaning(item: IProjectProgram) {
    const { currentQuater, selectedPlaning } = this.store;
    const dialogRef = this.dialog.open(AnnualProjectPlaningFormComponent, {
      data: { project: selectedPlaning, parent: item, quater: currentQuater },
      disableClose: true,
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      height: '96vh',
      role: 'dialog',
    });
    dialogRef.updatePosition({ top: '16px', right: '16px', bottom: '16px' });
  }


  _onDelete(item: IProjectProgram) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: item.name, item: item, isDelete: true, headerText: `លុប: ${item?.name}` },
      panelClass: 'cs-dialog-wrapper',
      width: '580px',
      disableClose: false,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result && result.key) {
        await this.store.delete(item).then(() => {
          this.snackBar.open(`${item?.name} has been deleted successful.`, "Done", { duration: 1000 });
        }).catch(err => {
          alert(err)
        }).finally(() => {

        })
      }
    })
  }

  showDetail(item: any, q: any[]){

    let dialogRef = this.dialog.open(AnnualProjectDetailCommentComponent, {
      data: { ITEM: item ? item : null, projectKey: item?.project?.key, itemKey: item?.key},
      panelClass: 'open-file-panel',
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      disableClose: true,
      // role: 'dialog',
    });
    dialogRef.updatePosition({ top: '0', right: '0', bottom: '0' });
    dialogRef.afterClosed().subscribe(result => { });
  }

}
