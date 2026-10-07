import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { IComment, IDelete, IFileComment, IUpdate } from 'src/app/interfaces/document/document.interface';
import { DataService } from 'src/app/shared/services/data.service';
import { pageKey } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';
import { DatabaseService } from '../../services/database.service';
import { DeleteComponent } from '../delete/delete.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireStorageService } from '../../services/fireStorage.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';
import { Observable } from 'rxjs';
import swal from 'sweetalert';

@Component({
    selector: 'app-document-application-form-comments',
    templateUrl: './document-application-form-comments.component.html',
    styleUrls: ['./document-application-form-comments.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentApplicationFormCommentsComponent implements OnInit, OnDestroy {
  @ViewChild('fileComment') fileComment: ElementRef;
  @ViewChild("focusInput") inputEl: ElementRef;

  commentForm: UntypedFormGroup;
  SELECTED_FILES = [];
  SELECTED_FILES_EDIT = [];
  img: [];
  defaultImg = PHOTO_LIB.EMPTY;
  editImg = '../../../../assets/images/delete-button-red.png';
  ITEM: IComment;
  keyComment: string
  edit: boolean = false
  dataFileComment: any[] = [];
  recording: boolean = false;
  recordingEdit: boolean = false;
  files_voice: any = null;
  SELECTED_COMMENT_VOID = [];
  record: any;
  recordVideo: any;
  //Will use this flag for toggeling recording
  //URL of Blob
  urlAudio: any;
  urlAudioArray: [];
  error: any;
  hasInput: boolean = false;
  START_UPLOAD: boolean = false;
  uploadPercent: Observable<number>;

  urlAudioEdit: any;
  files_voiceEdit: any = null;
  SELECTED_COMMENT_VOID_EDIT = [];
  recordEdit: any;
  recordVideoEdit: any;
  dataEditFile: any;
  fileImage: any;
  //Will use this flag for toggeling recording
  //URL of Blob

  constructor(
    private fb: UntypedFormBuilder,
    public ds: DataService,
    public store: DocumentStore,
    private auth: AuthStore,
    private dbs: DatabaseService,
    private dialog: MatDialog,
    private afs: AngularFirestore,
    private snackBar: MatSnackBar,
    private storage: FireStorageService,
    private domSanitizer: DomSanitizer,

  ) { }

  ngOnInit(): void {
    this.auth.getUser();
    this.commentForm = this.fb.group({
      comment: [null, Validators.required],
      SELECTED_FILES_EDIT: [null],
      text: [null]
    })
    const { headerDocument } = this.store;
    this.store.fetchDocumentComment(headerDocument?.key, data => {
    })
  }

  ngOnDestroy() {
    const { fetchDocumentCommentRef } = this.store;
    fetchDocumentCommentRef && fetchDocumentCommentRef.unsubscribe()
  }

  onSelectedFile(event) {
    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        this.SELECTED_FILES.push(element);
        this.SELECTED_FILES.forEach(m => {
          this.fileImage = m;
          const fileComment = this.fileImage.type;


        })
      }
      if (this.fileComment) this.fileComment.nativeElement.value = "";
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "សូមដកមតិជារូបភាពដែលមានហើយជាមុនសិន!",
          icon: "warning",
          dangerMode: true,
        });
    }
  }

  eachFile: any;
  onSelectedUpdateFile(event) {

    if (event && event.target.files.length > 0) {
      for (let index = 0; index < event.target.files.length; index++) {
        const element = event.target.files[index];
        this.SELECTED_FILES_EDIT.push(element);
      }
      if (this.fileComment) this.fileComment.nativeElement.value = "";
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "សូមដកមតិជារូបភាពដែលមានហើយជាមុនសិន!",
          icon: "warning",
          dangerMode: true,
        });
    }
  }

  trackByIdx(i) {
    return i;
  }
  onEditComment(item) {
    if (this.edit == false) {
      this.edit = true
      let ITEM = item;
      this.ITEM = ITEM;
      const { files, text } = ITEM;
      if (ITEM) {
        this.commentForm.patchValue({
          text,
          files
        })
      }
      this.dataFileComment = files;
      this.dataFileComment?.forEach(data => {
        this.eachFile = data;

      });
      this.keyComment = ITEM?.key;
      setTimeout(() => {
        this.inputEl.nativeElement.focus();
      }, 1);
    } else {
      this.snackBar.open('សូមបិទប្រអប់កែប្រែមតិយោបល់ចាស់ជាមុនសិន។', 'យល់ព្រម')
    }
  }
  onEditReplyComment(item) {
    if (this.edit == false) {
      this.edit = true;
      let ITEM = item;
      this.ITEM = ITEM;
      const { files, text } = ITEM;
      if (item) {
        this.commentForm.patchValue({
          text,
          files
        })
      }
      this.dataFileComment = files;
      this.keyComment = ITEM?.key;
      this.dataFileComment?.forEach(data => {
        this.eachFile = data;
      });
      setTimeout(() => {
        this.inputEl.nativeElement.focus();
      }, 1);
    } else {
      this.snackBar.open('សូមបិទប្រអប់កែប្រែមតិយោបល់ចាស់ជាមុនសិន។', 'យល់ព្រម')
    }
  }

  _deleteEditFile(item: any) {
    if (!this.ITEM) return;
    let dialogRef = this.dialog.open(DeleteComponent, {
      data: { title: 'Delete Cover', memo: 'Cover will delete from system.', name: item.name },
      width: '35vw',
      disableClose: true,
      role: 'dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      const uid = this.auth?.profile?.key;
      if (result === 'yes') {
        const { headerDocument } = this.store;
        const dataHeader = this.store.headerDocument;
        this.storage.storageRef(item.filename).delete();
        this.ITEM.files = this.ITEM.files.filter(m => m?.key !== item?.key);
        this.store.update(this.dbs.documentHeaderRef().doc(dataHeader?.key).collection('documentComments'), this.ITEM, (success, error) => {
          if (success) {
            this.dataFileComment = this.ITEM.files;
            this.snackBar.open("រូបភាពត្រូវបានលុប", "យល់ព្រម", { duration: 2000 });
          } else {
            this.snackBar.open(error, 'error')
          }
        })
      }
    });
  }

  isReply: boolean = false;
  replyData = null;
  onReply(item) {
    this.replyData = item;
  }
  onCancelReply() {
    this.replyData = null;
  }
  cancelEdit() {
    if (this.commentForm.controls['text'].valid || this.dataFileComment.length > 0) {
      this.commentForm.controls['text'].reset();
      this.SELECTED_FILES_EDIT = [];
      this.dataFileComment = [];
      this.eachFile = null;
      this.edit = false;
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "ប្រអប់មតិមិនអាចទទេបានទេ!",
          icon: "warning",
          dangerMode: true,
        });;
    }
  }
  _removeFile(file) {
    const newFile = this.SELECTED_FILES.filter(m => m.name !== file.name);
    this.SELECTED_FILES = newFile || [];
  }
  _removeEditFile(file) {
    const newFile = this.SELECTED_FILES_EDIT.filter(m => m.name !== file.name);
    this.SELECTED_FILES_EDIT = newFile || [];
  }
  async onComment(f) {
    if (this.commentForm.valid || this.SELECTED_FILES.length > 0) {
      const { comment } = f;
      const key = this.ds.createId();
      const data: IComment = {
        key: key,
        created_at: this.ds.serverTimestamp(),
        created_by: this.auth?.profile?.key,
        updated_at: this.ds.serverTimestamp(),
        date_key: this.auth?.profile?.key,
        page_key: pageKey(),
        isHeader: this.replyData ? false : true,
        headerKey: this.replyData?.key ?? null,
        text: comment ?? null,
        files: [],
        hasSent: false,
        displayName: this.auth?.profile?.displayName,
        status: STATUS_OBJ.ACTIVE,
      }
      this.store.onComment(this.store.headerDocument, data, this.SELECTED_FILES, success => {
        if (success) {
          this.SELECTED_FILES = [];
          this.replyData = null;
          this.commentForm.reset();
        } else {
          alert('error')
        }
      })

    }
  }

  deleteComment(e) {
    const ref = this.dialog.open(DeleteComponent, {
      data: { isDelete: false, name: e?.text, memo: `តើលោកអ្នកចង់លុបមតិនេះចេញពីប្រព័ន្ធមែនទេ?` },
      panelClass: 'cs-dialog-doc',
      width: '500px',
      disableClose: true,
      role: 'dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'yes') {

        const key = e?.key;
        const dataHeader = this.store.headerDocument;
        const data: IDelete = {
          status: STATUS_OBJ.DELETED,
        }
        this.dbs.headerDocumentRef().doc(dataHeader?.key).collection('documentComments').doc(key).update(data).then(() => {
          this.eachFile = null;
        }).catch(error => {
          this.snackBar.open(error, 'យល់ព្រម')
        })

      }
    })
  }


  sanitize(url: string) {
    const dataVoice = this.domSanitizer.bypassSecurityTrustUrl(url)
    this.files_voice = dataVoice;
    return this.files_voice;
  }
  /**
  * Start recording.
  */
  initiateRecording() {

    if (this.SELECTED_FILES.length == 0 && !this.files_voice) {
      this.recording = true;
      let mediaConstraints = {
        video: false,
        audio: true
      };
      navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "សូមដកមតិជាសម្លេងដែលមានហើយជាមុនសិន!",
          icon: "warning",
          dangerMode: true,
        });
    }
  }
  /**
  * Will be called automatically.
  */
  successCallback(stream: any) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 2,
      // sampleRate: 16000,
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.recordVideo = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
  * Stop recording.
  */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }
  /**
  * processRecording Do what ever you want with blob
  * @param  {any} blob Blog
  */
  processRecording(blob: any) {
    this.urlAudio = URL.createObjectURL(blob);
    // this.SELECTED_COMMENT_IMAGE.push(this.urlAudio)
    // fetch(blob).then(response => {
    // })
    const nameDate = new Date;
    const dateToName = nameDate.toString()

    fetch(this.urlAudio).then(response => response.blob())
      .then(blob => {
        const fd = new FormData();
        fd.append("fileName", blob, dateToName + '.wav'); // where `.ext` matches file `MIME` type
        fd.forEach(data => {
          this.files_voice = data
          this.SELECTED_FILES.push(this.files_voice);
        })
        this.hasInput = true;
      })
      .then(response => response)
      .then(res => console.log('res', res))
      .catch(err => console.log('err', err));
  }
  /**
  * Process Error.
  */
  errorCallback(error: string) {
    this.error = 'Can not play audio in your browser', error;
  }

  removeAudioFile(file) {
    this.SELECTED_FILES = this.SELECTED_FILES.filter(m => m.name !== file.name);
    this.SELECTED_COMMENT_VOID = [];
    this.urlAudio = '';
    this.files_voice = '';
    this.hasInput = false;
  }

  ///////////////////////// edit voice /////////////////////////
  sanitizeEdit(url: string) {
    const dataVoice = this.domSanitizer.bypassSecurityTrustUrl(url)
    this.files_voiceEdit = dataVoice;
    return this.files_voiceEdit;
  }
  /**
  * Start recording.
  */
  initiateRecordingEdit() {
    if (this.eachFile?.type !== 'audio' && this.SELECTED_FILES_EDIT.length === 0) {
      this.recordingEdit = true;
      let mediaConstraints = {
        video: false,
        audio: true
      };
      navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "សូមដកមតិជាសម្លេងដែលមានហើយជាមុនសិន!",
          icon: "warning",
          dangerMode: true,
        });
    }
  }
  /**
  * Will be called automatically.
  */
  successCallbackEdit(stream: any) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 2,
      // sampleRate: 16000,
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.recordVideo = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
  * Stop recording.
  */
  stopRecordingEdit() {
    this.recordingEdit = false;
    this.record.stop(this.processRecordingEdit.bind(this));
  }
  /**
  * processRecording Do what ever you want with blob
  * @param  {any} blob Blog
  */
  processRecordingEdit(blob: any) {
    this.urlAudioEdit = URL.createObjectURL(blob);
    // this.SELECTED_COMMENT_IMAGE.push(this.urlAudio)
    // fetch(blob).then(response => {
    // })
    const nameDate = new Date;
    const dateToName = nameDate.toString()

    fetch(this.urlAudioEdit).then(response => response.blob())
      .then(blob => {
        const fd = new FormData();
        fd.append("fileName", blob, dateToName + '.wav'); // where `.ext` matches file `MIME` type
        fd.forEach(data => {
          this.files_voiceEdit = data
          this.SELECTED_FILES_EDIT.push(this.files_voiceEdit);
        })
        this.hasInput = true;
      })
      .then(response => response)
      .then(res => console.log('res', res))
      .catch(err => console.log('err', err));
  }
  /**
  * Process Error.
  */
  errorCallbackEdit(error: string) {
    this.error = 'Can not play audio in your browser', error;
  }

  removeAudioFileEdit(file) {
    this.SELECTED_FILES_EDIT = this.SELECTED_FILES_EDIT.filter(m => m.name !== file.name);
    this.SELECTED_FILES_EDIT = [];
    this.urlAudioEdit = '';
    this.files_voiceEdit = '';
    this.hasInput = false;
  }

  textChange(event) {
    if (event.length > 0) {
      this.hasInput = true;
    } else {
      this.hasInput = false;
    }
  }

  onSendEdit(f) {
    if (this.hasInput == true || this.commentForm.controls['text'].value !== "" || this.SELECTED_FILES_EDIT.length > 0 || this.dataFileComment.length > 0) {
      const { text, files } = f;
      const data: IComment = {
        key: this.keyComment,
        created_at: this.ITEM ? this.ITEM?.created_at : this.ds.serverTimestamp(),
        created_by: this.auth?.profile?.key,
        updated_at: this.ds.serverTimestamp(),
        date_key: this.auth?.profile?.key,
        page_key: pageKey(),
        isHeader: this.ITEM.isHeader,
        headerKey: this.ITEM.headerKey,
        text: text ?? null,
        files: this.ITEM ? this.ITEM?.files : [],
        hasSent: false,
        displayName: this.auth?.profile?.displayName,
        status: STATUS_OBJ.ACTIVE,
      }
      this.store.updateComment(this.store.headerDocument, data, this.SELECTED_FILES_EDIT, success => {
        if (success) {
          this.SELECTED_FILES_EDIT = [];
          this.replyData = null;
          this.dataFileComment = [];
          this.commentForm.reset();
          this.eachFile = null;
          this.edit = false;
        } else {
          alert('error');
        }
      })
    } else {
      swal(
        {
          title: "ជូនដំណឹង",
          text: "ប្រអប់មតិមិនអាចទទេបានទេ!",
          icon: "warning",
          dangerMode: true,
        });;
    }
  }
}
