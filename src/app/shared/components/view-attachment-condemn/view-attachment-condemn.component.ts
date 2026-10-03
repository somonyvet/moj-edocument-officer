import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { DOCUMENT_ATTACHMENT_TYPES } from 'src/app/dummy/report';
import { FileInfo } from 'src/app/interfaces/attendance';
import { AuthStore } from 'src/app/stores/auth.store';
import { CriminalApplicationStore } from '../../../modules/criminal-record/stores/criminalApplication.store';
import { transformImageSameTokenNo } from '../../services/fireStorage.service';
import { MappingService } from '../../services/mapping.service';
import { Lightbox } from 'ngx-lightbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { addDay, ConvertService } from '../../services/convert.service';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-view-attachment-condemn',
  templateUrl: './view-attachment-condemn.component.html',
  styleUrls: ['./view-attachment-condemn.component.scss']
})
export class ViewAttachmentCondemnComponent implements OnInit {
  @ViewChild('docFile', { static: false }) docFile: ElementRef;

  data: any = null;
  selectedImage: any = null;
  SVG = '../../../../../../assets/images/pdf-svgrepo-com.svg'

  lottie: AnimationOptions = {
    path: '../../../../../../assets/animate/109279-checklist.json',
  };

  DOCUMENT_ATTACHMENT_TYPES: any[] = DOCUMENT_ATTACHMENT_TYPES
  isKhmerForm: boolean = false;

  profilePhoto = null;

  ATTACHMENTS_ARRAY: any = []

  CRfiles = []
  constructor(
    public store: CriminalApplicationStore,
    public auth: AuthStore,
    private _lightbox: Lightbox,
    private snackBar: MatSnackBar,
    private ds: DataService,

  ) { }

  ngOnInit(): void {
    const { selectedCriminalRecord, attachment_files } = this.store;
    this.isKhmerForm = selectedCriminalRecord?.national_application?.key === 'khmer';
    this.DOCUMENT_ATTACHMENT_TYPES = DOCUMENT_ATTACHMENT_TYPES?.filter(m => m?.forKhmer === this.isKhmerForm)?.map(m => {
      const file = attachment_files?.find(f => f?.docType?.key === m?.key) || null;
      return { ...m, file }
    })
    this.profilePhoto = selectedCriminalRecord?.photo
    this.ATTACHMENTS_ARRAY = this.DOCUMENT_ATTACHMENT_TYPES.concat([{ key: 6, name: `ឯកសារផ្សេងៗ`, name_en: `Passport copy`, forKhmer: false, required: true, data: [], icon: 'widgets' }])

    this.CRfiles = [];
    if (selectedCriminalRecord) {
      const { attachments } = selectedCriminalRecord;
      const groupDoc: FileInfo[] = MappingService.groupBy(attachments || [], "docType.key", "docType.key");
      this.CRfiles = groupDoc.map(m => {
        const { docType } = m;
        const items = attachments.filter(r => r?.docType?.key === docType?.key)?.map((m: any) => ({ ...m, file_uri: m?.type === 'image' ? (m?.downloadUrl ? transformImageSameTokenNo(m?.downloadUrl, '680').uri : null) : m?.downloadUrl }));
        return {
          ...docType,
          data: items?.filter(m => m?.file_uri),
        }
      })
    }

  }

  openImg(files): void {
    if (files.length === 0) return
    const _albums = files.map(f => (
      {
        src: f.downloadUrl,
        caption: "",
        thumb: f.downloadUrl,
      }
    ))
    this._lightbox.open(_albums, 0, { wrapAround: true, showImageNumberLabel: true, showRotate: true, centerVertically: true });
  }

  removeFile(file: any) {
    this.CRfiles = []
    const { selectedCriminalRecord } = this.store;
    const { attachments } = selectedCriminalRecord;

    const lessAttachments = attachments.filter(m => m.key !== file.key)
    const groupDoc: FileInfo[] = MappingService.groupBy(lessAttachments || [], "docType.key", "docType.key");
    this.CRfiles = groupDoc.map(m => {
      const { docType } = m;
      const items = lessAttachments.filter(r => r?.docType?.key === docType?.key)?.map((m: any) => ({ ...m, file_uri: m?.type === 'image' ? (m?.downloadUrl ? transformImageSameTokenNo(m?.downloadUrl, '680').uri : null) : m?.downloadUrl }));
      return {
        ...docType,
        data: items?.filter(m => m?.file_uri),
      }
    })

    this.store.removeFileCriminalRecord(selectedCriminalRecord?.key, attachments, file, (res) => {
      if (res) {
        this.snackBar.open(`លុបឯកសារបានដោយជោគជ័យ`, "ជោគជ័យ", { duration: 2000 });
      }
    })
  }

  async onSelectedFile(docType, event) {
    this.store.SELECTED_FILES = []
    if (event && event.target.files.length > 0) {

      const newFiles = Array.from(event.target.files)
      for (let index = 0; index < newFiles.length; index++) {
        const element: any = newFiles[index];
        this.store.SELECTED_FILES.push({ docType: docType, file: element })
      }
      const { selectedCriminalRecord } = this.store;
      this.store.saveFileCriminalRecord(selectedCriminalRecord, (res, attachments) => {
        if (res) {
          this.snackBar.open(`បន្ថែមឯកសារបានដោយជោគជ័យ`, "ជោគជ័យ", { duration: 2000 });
          const groupDoc: FileInfo[] = MappingService.groupBy(attachments || [], "docType.key", "docType.key");
          this.CRfiles = groupDoc.map(m => {
            const { docType } = m;
            const items = attachments.filter(r => r?.docType?.key === docType?.key)?.map((m: any) => ({ ...m, file_uri: m?.downloadUrl }));
            return {
              ...docType,
              data: items?.filter(m => m?.file_uri),
            }
          })

        }
      })

      this.docFile.nativeElement.value = "";
    }
  }

}

