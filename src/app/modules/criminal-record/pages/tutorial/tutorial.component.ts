import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PHOTO_LIB, TUTORIAL_TYPE } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { criminal_tabs } from '../../dummy/criminal.dummy';
import { CriminalStore } from '../../stores/criminal.store';
import { TutorialStore } from '../../stores/tutorial.store';
import { TutorialDocumentFormComponent } from './tutorial-document-form/tutorial-document-form.component';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TutorialComponent implements OnInit,OnDestroy {
  tabs = criminal_tabs.crime_tutorials;
  loading: boolean = true;
  loadingMore: boolean = false;
  params: any = null;
  title: string = `របៀបប្រើប្រាស់`;

  tutorialType = TUTORIAL_TYPE;
  child: any = null;
  subscriptionRoute: any;

  constructor(private route: ActivatedRoute,
    public store: TutorialStore,
    public criminal: CriminalStore,
    public auth: AuthStore,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const { module } = this.criminal;
    this.criminal.newButtonName = `បញ្ចូលរបៀបប្រើប្រាស់`;
    this.criminal.componentDialog = TutorialDocumentFormComponent;
    this.tabs = criminal_tabs.crime_tutorials?.map(m => ({ ...m, path: `/${module?.module_name}/${module?.router}/tutorial/${m?.key}` }))

    this.route.firstChild.url.subscribe(x=> {
      const path = x[0]?.path
      const type = TUTORIAL_TYPE[path.toUpperCase()]
      this.store.fetchData(type,(status,data)=>{
        this.loading = false;
      })
    });

    this.router.events.subscribe(e => {
      if (this.child !== this.route.firstChild) {
        this.subscriptionRoute?.unsubscribe();
        this.child = this.route.firstChild;
        this.subscriptionRoute = this.route.firstChild.url.subscribe(x=> {
          const path = x[0]?.path
          const type = TUTORIAL_TYPE[path.toUpperCase()]
          this.store.fetchData(type,(status,data)=>{
            this.loading = false;
          })
        });
      }
    });
  }

  async ngOnDestroy(): Promise<void> {
    this.criminal.routerCreate = null;
    this.criminal.componentDialog = null;
    this.subscriptionRoute?.unsubscribe();
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  async scrollHandler(e) {
  }


  trackByIdx(i) {
    return i;
  }

  onSearch(value) {
  }

  onDelete(item){
    this.store.delete(item.key,error=>{
      if(!error){
        this.snackBar.open(`លុបរបៀបប្រើប្រាស់បានជោគជ័យ`, 'បិទ', { duration: 3000 });
      }else{
        alert(error)
      }
    })
  }

}
