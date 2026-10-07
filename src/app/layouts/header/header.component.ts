import { AuthStore } from '../../stores/auth.store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { UntypedFormGroup, AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { driveObj } from 'src/app/dummy/status';
import { SearchFormComponent } from 'src/app/shared/components/search-form/search-form.component';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../shared/services/data.service';
import { SideNavService } from '../../shared/services/sidenav.servce';
import { OpenFileComponent } from '../../modules/file-manager/components/open-file/open-file.component';
interface Food {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderComponent implements OnInit {
  toggleSidebar;
  ismobile = false;
  form: UntypedFormGroup;
  search: AbstractControl;

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' }
  ];
  // search: AbstractControl;
  company: AbstractControl;
  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public store: AuthStore,
    public ds: DataService,
    public breakpointObserver: BreakpointObserver,
    private router: Router,
    private sideNavService: SideNavService,
    public drive: FileManager,

  ) { }

  async ngOnInit() {
    this.form = this.fb.group({
      search: [null, [Validators.required]]
    })
    this.search = this.form.controls['search'];
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
      });

    const path = {
      key: 'my_files',
      name: 'បណ្ណសារដ្ឋាន',
      name_en: 'My Files',
      path: '/my_files',
      isMyFile: true,
    }
    const { selectedCompany, root } = this.store;
    this.drive.fetchSearchListing(this.store.root, path)
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (false)),
        switchMap(value => this.drive.fetchSearch(value, root, path, selectedCompany.key, data => { }))
      ).subscribe();
  }

  onOptionSelected(event) {
    const { value } = event.option;
    const { type } = value;
    //if open file
    if (type.key === driveObj.file.key) {
      const { fileType, downloadURL } = value;
      let openByIFrame: boolean = true;
      if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL, "_blank");
        return;
      };
      this.dialog.open(OpenFileComponent, {
        data: { ITEM: value, openByIFrame },
        width: '80vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    //if open folder
    this.router.navigate([`/my_files/${value.key}`])
  }

  ngOnDestroy() {
    const { fetchSearchListingRef, fetchSearchRef } = this.drive;
    fetchSearchListingRef && fetchSearchListingRef.unsubscribe();
    fetchSearchRef && fetchSearchRef.unsubscribe();
  }

  toggleActive: boolean = false;
  toggleChartbar() {
    this.sideNavService.toggle();
  }

  togglesidebar() {
    let body = document.getElementsByClassName("page-wrapper")[0];
    body.classList.toggle("toggled-sidebar");
    this.toggleSidebar = !this.toggleSidebar;
    localStorage.setItem("toggleSidebar", this.toggleSidebar)
  }
  clear() {
    this.form.reset();
  }

  onLogOut() {
    this.ds.userFireRef().doc(this.store.user.uid).collection('histories').get().then(doc => {
      if (doc.size) {
        doc.forEach(item => {
          item.ref.delete().then(() => {
            this.store.signOut(() => {
              this.router.navigate(['/login'])
            });
          })
        });
      } else {
        this.store.signOut(() => {
          this.router.navigate(['/login'])
        });
      }

    })
  }


  searchFilter() {
    let dialogRef = this.dialog.open(SearchFormComponent, {
      // data: item ? item : null,
      panelClass: 'cs-overlay-panel',
      width: '600px',
      height: '',
      role: 'dialog',
    });

  }


}
