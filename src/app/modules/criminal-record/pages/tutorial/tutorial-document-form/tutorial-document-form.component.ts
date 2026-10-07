import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CONTENT_TYPE, CONTENT_TYPE_ARRAY, TUTORIAL_TYPE, TUTORIAL_TYPE_ARRAY } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { generateKeywords } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { TutorialStore } from '../../../stores/tutorial.store';

@Component({
    selector: 'app-tutorial-document-form',
    templateUrl: './tutorial-document-form.component.html',
    styleUrls: ['./tutorial-document-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TutorialDocumentFormComponent implements OnInit, OnDestroy {
  @ViewChild('photoFile') photoFile: ElementRef;

  form: UntypedFormGroup

  selectedType: any = null;
  tutorialTypeArray = TUTORIAL_TYPE_ARRAY;
  tutorialType = TUTORIAL_TYPE;
  process: boolean = false;

  answer:any = null;
  answer_en:any = null;
  // content:any = null;
  // content_en:any = null;

  content_type_array = CONTENT_TYPE_ARRAY;
  content_type = CONTENT_TYPE;

  selected_photo: any = [];

  selected_cover: any = null;
  selected_cover_array :any = [];

  constructor(
    public dialogRef: MatDialogRef<TutorialDocumentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    private fb: UntypedFormBuilder,
    public store: TutorialStore,
    private ds : DataService,
    private auth : AuthStore,
    private snackbar : MatSnackBar,
    public storage: FireStorageService,
  ) { }

  quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['clean']
    ]
  };

  modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  ngOnInit(): void {
    if(this.data?.item){
      this.buildForm(this.data?.item?.type);
      this.answer = this.data?.item?.answer||null;
      this.answer_en = this.data?.item?.answer_en||null;
    }else{
      this.form = this.fb.group({})
    }
  }

  buildForm(type) {
    if (type?.key === this.tutorialType?.FAQS?.key) {
      this.form = this.fb.group({
        question: [this.data?.item?.question||null, Validators.required],
        answer: [this.data?.item?.answers||null],
        question_en: [this.data?.item?.question_en||null, Validators.required],
        answer_en: [this.data?.item?.answers_en||null],
      })
    } else if (type?.key === this.tutorialType?.VIDEOS?.key) {
      this.form = this.fb.group({
        title: [this.data?.item?.title||null, Validators.required],
        title_en: [this.data?.item?.title_en||null, Validators.required],
        url: [this.data?.item?.url||null, Validators.required],
      })
    } else {
      this.form = this.fb.group({
        title: [this.data?.item?.title||null, Validators.required],
        title_en: [this.data?.item?.title_en||null, Validators.required],
        description: [this.data?.item?.description?.null],
        description_en: [this.data?.item?.description_en||null],
        content_array: new UntypedFormArray([])
      })
    }
    this.store.selectedType = type;
  }


  async _onSave(f) {
    if(!this.form?.valid) return
    this.process = true;
    this.form.disable();
    if(this.store.selectedType?.key === this.tutorialType?.FAQS?.key) {
      const { question, question_en , answer ,answer_en } = f
      const data = {
        key : this.data?.item?.key || this.ds?.createId(),
        created_by : this.data?.item?.created_by || this.store.getMappedProfile(),
        created_at : this.data?.item?.created_at || this.ds.serverTimestamp(),
        updated_by : this.store.getMappedProfile(),
        updated_at : this.ds.serverTimestamp(),
        type : this.store.selectedType,
        keywords : generateKeywords([question,question_en]),

        question: question || null,
        question_en: question_en || null,
        answer: answer || null,
        answer_en: answer_en || null,
      }
      this.store.save(data,(error)=>{
        if(error) {
          alert(error)
          this.process= false;
          this.form.enable();
        }else{
          this.form.reset();
          this.snackbar.open(`របៀបប្រើប្រាស់ត្រូវបានរក្សាទុកដោយជោគជ័យ`, "យល់ព្រម", { duration: 6000 })
          this.process= false;
          this.form.enable();
        }
      })
    }else if(this.store.selectedType?.key === this.tutorialType?.VIDEOS?.key) {
      const { title , title_en, url } = f
      const data = {
        key : this.data?.item?.key || this.ds?.createId(),
        created_by : this.data?.item?.created_by || this.store.getMappedProfile(),
        created_at : this.data?.item?.created_at || this.ds.serverTimestamp(),
        updated_by : this.store.getMappedProfile(),
        updated_at : this.ds.serverTimestamp(),
        type : this.store.selectedType,
        keywords : generateKeywords([title,title_en]),

        title: title || null,
        title_en: title_en || null,
        url: url || null,
        cover: null
      }

      if(this.selected_cover){
        const file = await this.storage.upload([this.selected_cover])
        data.cover = file[0]
      }

      this.store.save(data,(error)=>{
        if(error) {
          alert(error)
          this.process= false;
          this.form.enable();
        }else{
          this.form.reset();
          this.snackbar.open(`របៀបប្រើប្រាស់ត្រូវបានរក្សាទុកដោយជោគជ័យ`, "យល់ព្រម", { duration: 6000 })
          this.process= false;
          this.form.enable();
        }
      })
    }else{

      const { title , title_en, content_array, description, description_en } = f
      const data = {
        key : this.data?.item?.key || this.ds?.createId(),
        created_by : this.data?.item?.created_by || this.store.getMappedProfile(),
        created_at : this.data?.item?.created_at || this.ds.serverTimestamp(),
        updated_by : this.store.getMappedProfile(),
        updated_at : this.ds.serverTimestamp(),
        type : this.store.selectedType,
        keywords : generateKeywords([title,title_en]),

        title: title || null,
        title_en: title_en || null,
        description: description || null,
        description_en: description_en || null,
        content_array: content_array || null,
      }

      if(this.selected_cover_array?.length > 0){
        for(let i = 0; i < this.selected_cover_array?.length; i++){
          const file = await this.storage.upload([this.selected_cover_array[i]?.file])
          data.content_array[this.selected_cover_array[i]?.index].cover = file[0]
          data.content_array[this.selected_cover_array[i]?.index].content_en = data.content_array[this.selected_cover_array[i]?.index].content
        }
      }

      if(this.selected_photo?.length > 0){
        for(let i = 0; i < this.selected_photo?.length; i++){
          const file = await this.storage.upload([this.selected_photo[i]?.file])
          data.content_array[this.selected_photo[i]?.index].content = file[0]
          data.content_array[this.selected_photo[i]?.index].content_en = file[0]
        }
      }

      this.store.save(data,(error)=>{
        if(error) {
          alert(error)
          this.process= false;
          this.form.enable();
        }else{
          this.form.reset();
          this.snackbar.open(`របៀបប្រើប្រាស់ត្រូវបានរក្សាទុកដោយជោគជ័យ`, "យល់ព្រម", { duration: 6000 })
          this.process= false;
          this.form.enable();
        }
      })
    }
  }

  addFormArray(type){
    const formArray = this.form.get('content_array') as UntypedFormArray;
    formArray.push(this.fb.group({
      content: [null],
      content_en: [null],
      type: type,
    }))
  }

  removeFormArray(index){
    const formArray = this.form.get('content_array') as UntypedFormArray;
    formArray.removeAt(index)
    this.selected_photo = this.selected_photo?.filter(f=>f?.index!==index)
  }

  onSelectedFile(event,index) {
    if (event && event.target.files.length > 0) {
      this.selected_photo = this.selected_photo.filter(f=>f?.index!==index)
      this.selected_photo.push({
        file: event.target.files[0],
        index: index,
      })
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        //display img to screen
      }
      this.photoFile.nativeElement.value = "";
    }
  }

  onSelectVideoCover(event){
    if (event && event.target.files.length > 0) {
      this.selected_cover = event.target.files[0]
    }
  }

  onSelectVideoCover_array(event,index) {
    if (event && event.target.files.length > 0) {
      this.selected_cover_array = this.selected_cover_array.filter(f=>f?.index!==index)
      this.selected_cover_array.push({
        file: event.target.files[0],
        index: index,
      })
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        //display img to screen
      }
      this.photoFile.nativeElement.value = "";
    }
  }

  ngOnDestroy() {
    this.store.selectedType = null;
  }

}
