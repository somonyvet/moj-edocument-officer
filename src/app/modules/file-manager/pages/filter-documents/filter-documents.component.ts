import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { toJS } from 'mobx';
import { Observable } from 'rxjs';
import { driveObj } from 'src/app/dummy/status';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { OpenFileComponent } from '../../components/open-file/open-file.component';

@Component({
    selector: 'app-filter-documents',
    templateUrl: './filter-documents.component.html',
    styleUrls: ['./filter-documents.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FilterDocumentsComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  organization: AbstractControl;
  category: AbstractControl;
  sector: AbstractControl;
  signer: AbstractControl;

  filteredOrganizationOptions: Observable<any[]>;
  filteredCategoryOptions: Observable<any[]>;
  filteredSectorsOptions: Observable<any[]>;
  filteredSignerOptions: Observable<any[]>;
  params: any;
  parentFolder = "my_files";

  constructor(private fb: UntypedFormBuilder,
    public ds: DataService,
    private auth: AuthStore,
    private route: ActivatedRoute,
    private router: Router,
    private dialog:MatDialog,
    public store: FileManager) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      keyword: [null],
      organization: [null, [MappingService.validSelected.bind(this)]],
      category: [null, [MappingService.validSelected.bind(this)]],
      signer: [null, [MappingService.validSelected.bind(this)]],
      sector: [null, [MappingService.validSelected.bind(this)]],
      issueDate: [null],
    })
    this.organization = this.form.controls['organization']
    this.category = this.form.controls['category']
    this.sector = this.form.controls['sector']
    this.signer = this.form.controls['signer']
    this.store.data = [];
    this.store.empty = false;
    this.store.loading = false;
    const param = this.route.snapshot.queryParams;
    this.route.queryParams.subscribe(params => {
      this.params = Object.keys(params).length > 0 ? params : null;
      const { keyword, issueDate } = params;
      if (keyword) {
        this.form.patchValue({
          keyword
        })
      }
      if (issueDate) {
        this.form.patchValue({
          issueDate: ConvertService.toDateFromKey(issueDate)
        })
      }
      if (this.params) {
        this.store.fetchSearchAndFilter(this.params, this.auth.root,res=>{
        })
      }else{
        this.form.reset()
      }
    })

    this.store.fetchCategories(res => {
      this.filteredCategoryOptions = MappingService.autoComplete(this.category, res, 'name')
      if (param?.category) {
        this.form.patchValue({
          category: res.find(m => m?.key === param?.category)
        })
      }
    })
    this.store.fetchSigner(res => {
      this.filteredSignerOptions = MappingService.autoComplete(this.signer, res, 'displayName')
      if (param?.signer) {
        this.form.patchValue({
          signer: res.find(m => m?.key === param?.signer)
        })
      }
    })
    this.store.fetchOrganizations(res => {
      this.filteredOrganizationOptions = MappingService.autoComplete(this.organization, res, 'name')
      if (param?.organization) {
        this.form.patchValue({
          organization: res.find(m => m?.key === param?.organization)
        })
      }
    })
    this.store.fetchSectors(res => {
      this.filteredSectorsOptions = MappingService.autoComplete(this.sector, res, 'name')
      if (param?.sector) {
        this.form.patchValue({
          sector: res.find(m => m?.key === param?.sector)
        })
      }
    })

  }

  ngOnDestroy(): void {
    this.store.subscribeFolderForm()
  }

  onSearch(f) {
    if (this.params) {
      this.router.navigate([`/file-manager/filter-documents`])
      return;
    }
    const { keyword, organization, category, signer, sector, issueDate } = f;
    let keywordSearch: Object = {}
    if (organization?.key) {
      keywordSearch = Object.assign(keywordSearch, { organization: organization?.key })
    }
    if (category?.key) {
      keywordSearch = Object.assign(keywordSearch, { category: `${category?.key}` })
    }
    if (signer?.key) {
      keywordSearch = Object.assign(keywordSearch, { signer: `${signer?.key}` })
    }
    if (sector?.key) {
      keywordSearch = Object.assign(keywordSearch, { sector: `${sector?.key}` })
    }
    if (issueDate) {
      keywordSearch = Object.assign(keywordSearch, { issueDate: `${ConvertService.toDateKey(issueDate)}` })
    }
    if (keyword) {
      keywordSearch = Object.assign(keywordSearch, { keyword: `${keyword}` })
    }
    this.router.navigate([`/file-manager/filter-documents`], { queryParams: keywordSearch })
  }


  onOpenItem(item: any) {
    const { type } = item;
    this.store.selectedItem = item;
    if (type.key === driveObj.file.key) {
      const { fileType, downloadURL } = item;
      let openByIFrame: boolean = true;
      if (fileType !== 'application/pdf' && fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
        openByIFrame = false;
        window.open(downloadURL, "_blank");
        return;
      };
      this.dialog.open(OpenFileComponent, {
        data: { ITEM: item, openByIFrame },
        // data: item ? item : null,
        width: '80vw',
        height: '100vh',
        panelClass: 'open-file-panel',
        role: 'dialog',
      });
      return;
    }
    this.router.navigate([`/file-manager/my_files/${item.key}`, {}])
  }

  onSelectedItem(item: any) {
    this.store.selectedItem = item;
  }
}
