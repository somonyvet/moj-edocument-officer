import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IFolder } from 'src/app/interfaces/file-manager';
import { statusObj, driveObj } from 'src/app/dummy/status';
import { FileManager } from 'src/app/stores/fileDrive.store';
import { AuthStore } from 'src/app/stores/auth.store';
import { ConvertService } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { generateKeywords, getYear, MappingService, toOfficer, toRanking } from 'src/app/shared/services/mapping.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-folder',
  templateUrl: './new-folder.component.html',
  styleUrls: ['./new-folder.component.scss']
})
export class NewFolderComponent implements OnInit, OnDestroy {
  form: FormGroup;
  title: any = "បង្កើតទូឯកសារ"

  organization: AbstractControl;
  category: AbstractControl;
  sector: AbstractControl;
  signer: AbstractControl;

  filteredOrganizationOptions: Observable<any[]>;
  filteredCategoryOptions: Observable<any[]>;
  filteredSectorsOptions: Observable<any[]>;
  filteredSignerOptions: Observable<any[]>;

  hashtagItems: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<NewFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: FileManager,
    public afs: AngularFirestore,
    public auth: AuthStore,
    public ds: DataService,
  ) { }

  ngOnInit() {
    const item: IFolder = this.data?.FORM || null;
    this.title = !item ? 'បង្កើតទូឯកសារ' : "កែសម្រួលទូឯកសារ";
    this.form = this.fb.group({
      name: [null, Validators.compose([Validators.required])],
      hashtag: [null],
      organization: [null, [MappingService.validSelected.bind(this)]],
      category: [null, [MappingService.validSelected.bind(this)]],
      signer: [null, [MappingService.validSelected.bind(this)]],
      sector: [null, [MappingService.validSelected.bind(this)]],

      issueDate: [item?.issueDate?.toDate() || new Date() || null, [Validators.required]],
      refNo: [item?.refNo || null],

      fileTag: [null,],
      personalShare: [null,],
      group: [null,],
      folderSize: [null],
      allowUpload: [false],
      yearFolder: [false],
      rootLevel: [false],
    })
    this.organization = this.form.controls['organization']
    this.category = this.form.controls['category']
    this.sector = this.form.controls['sector']
    this.signer = this.form.controls['signer']

    this.hashtagItems = item?.hashtag || [];
    this.store.fetchCategories(res => {
      this.filteredCategoryOptions = MappingService.autoComplete(this.category, res, 'name')
      if (item && item?.category) {
        this.form.patchValue({
          category: res?.find(m => m?.key === item?.category?.key) || null,
        })
      }
    })
    this.store.fetchSigner(res => {
      this.filteredSignerOptions = MappingService.autoComplete(this.signer, res, 'displayName')
      if (item && item?.signer) {
        this.form.patchValue({
          signer: res?.find(m => m?.key === item?.signer?.key) || null,
        })
      }
    })
    this.store.fetchOrganizations(res => {
      this.filteredOrganizationOptions = MappingService.autoComplete(this.organization, res, 'name')
      if (item && item?.organization) {
        this.form.patchValue({
          organization: res?.find(m => m?.key === item?.organization?.key) || null,
        })
      }
    })
    this.store.fetchSectors(res => {
      this.filteredSectorsOptions = MappingService.autoComplete(this.sector, res, 'name')
      if (item && item?.sector) {
        this.form.patchValue({
          sector: res?.find(m => m?.key === item?.sector?.key) || null,
        })
      }
    })
    if (item) {
      this.form.patchValue({
        name: item.name,
        allowUpload: item.allowUpload,
        yearFolder: item.yearFolder,
        rootLevel: item.rootLevel,
      })
    }
  }

  ngOnDestroy(): void {
    this.store.subscribeFolderForm()
  }

  removeTag(tag: string) {
    this.hashtagItems = this.hashtagItems.filter(m => m !== tag.trim())
  }

  addTag(tag: string) {
    const find = this.hashtagItems.find(m => m === tag.trim())
    if (!find) {
      this.hashtagItems.push(tag.trim())
      this.form.controls['hashtag'].reset()
    }
  }



  async onSave(f: any) {
    // FireValidatorsService.checkExistByCompany(this.afs, selectedCompany.key,pathData[pathData.length - 1].key ,"file_folder", "name")

    if (this.form.valid) {
      this.form.disable();

      const { FORM } = this.data;
      const { selectedCompany, uid } = this.auth;
      const { pathData } = this.store;
      const { refNo, organization, sector, signer, category, issueDate, name, allowUpload, yearFolder, rootLevel, fileTag, personalShare, group, folderSize } = f;
      const key = this.afs.createId();

      let keywords = generateKeywords([name]).concat([uid, `~N/A~`])
      if (organization) {
        const orgName = generateKeywords([organization?.name]).concat([organization?.key])
        keywords = keywords.concat(orgName)
      }
      if (sector) {
        const orgName = generateKeywords([sector?.name]).concat([sector?.key])
        keywords = keywords.concat(orgName)
      }
      if (signer) {
        const orgName = generateKeywords([signer?.displayName]).concat([signer?.key])
        keywords = keywords.concat(orgName)
      }
      if (category) {
        const orgName = generateKeywords([category?.name]).concat([category?.key])
        keywords = keywords.concat(orgName)
      }
      if (issueDate) {
        keywords = keywords.concat([`${getYear(issueDate)}`])
        keywords = keywords.concat([`${ConvertService.toDateKey(issueDate)}`])
      }
      if (refNo) {
        keywords = keywords.concat([refNo])
      }
      if (this.hashtagItems?.length > 0) {
        keywords = keywords.concat(this.hashtagItems)
      }

      const tag = [
        key,
        this.auth?.user?.uid,
        ConvertService.toCapitalize(`${name}`.trim()),
        `~N/A~`,
        selectedCompany.key,
      ];

      const pathString = pathData.map(m => m.key);
      const item: IFolder = {
        key: FORM ? FORM.key : key,
        status: FORM ? FORM.status : statusObj.active,
        isDelete: false,
        isFavorite: FORM ? FORM.isFavorite : false,
        isParentDelete: FORM ? FORM.isParentDelete : false,
        created_at: FORM ? FORM.created_at : this.ds.serverTimestamp(),
        created_by: FORM ? FORM.created_by : this.auth.User,
        updated_by: this.auth.User,
        updated_at: this.ds.serverTimestamp(),
        deleted_by: null,
        deleted_at: null,
        date_key: FORM ? FORM.date_key : ConvertService.dateKey(),
        page_key: FORM ? FORM.page_key : ConvertService.pageKey(),
        keyword: ConvertService.toCapitalize(name),
        keywords: keywords,
        tag: tag,
        path: pathData,
        pathString: pathString,
        currentPath: pathData[pathData.length - 1],

        //fields
        name: name,
        fileTag: { color: FORM ? FORM.fileTag.color : '#79b8ff' },
        personalShareRef: [],
        personalShareKey: [],
        groupRef: [],
        groupKey: [],
        companyKey: selectedCompany.key,
        companyData: {
          key: selectedCompany.key,
          name: selectedCompany.name,
          id: selectedCompany.key || selectedCompany.key,
        },
        companyRef: this.ds.companyRef().doc(selectedCompany.key).ref,
        type: driveObj.folder,
        // allowUpload: allowUpload || false,
        // yearFolder: yearFolder || false,
        // rootLevel: rootLevel || false,

        allowUpload: true,
        yearFolder: false,
        rootLevel: false,

        hashtag: this.hashtagItems || [],
        organization: organization ? toRanking(organization) : null,
        category: category ? toRanking(category) : null,
        sector: sector ? toRanking(sector) : null,
        issueDate: issueDate || null,
        issueDateKey: issueDate ? ConvertService.toDateKey(issueDate) : null,
        refNo: refNo || null,
        signer: signer ? toOfficer(signer) : null,
      }
      this.store.addFolder(item, FORM ? true : false, (success, res) => {
        if (success) {
          this.form.enable();
          this.hashtagItems = [];
          this.dialogRef.close('yes')
        }
      })
    }
  }

}
