import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { action, observable } from 'mobx-angular';
import { DataService } from './data.service';
import { pageKey } from './mapping.service';

@Injectable({
  providedIn: 'root'
})
export class FirestorageFilesUploadService {

  @observable uploadPercent: number;
  @observable startUpload: boolean = false;

  private resolutions = [
    '_1024x1024',
    '_1280x1280',
    '_1920x1920',
    '_200x200',
    '_400x400',
    '_680x680',
    '_720x720'
  ];

  constructor(
    private ds: DataService,
    private storage: AngularFireStorage
  ) {
    this.uploadPercent = undefined;
    this.startUpload = false;
  }

  uploadSelectedFile(file, filePath) {
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    return task;
  }

  @action
  async upload(basePath: string, file: File) {
    this.startUpload = true;

    const id = this.ds.createId();
    const soundPath = `/${basePath}/${id}-${file?.name}`;
    const soundTask = this.uploadSelectedFile(file, soundPath);
    const fileType = file.type.split('/').slice(0, -1).join('/');

    // this.uploadPercent = soundTask.percentageChanges();
    soundTask.percentageChanges().subscribe((data) => {
      this.uploadPercent = data;
    });

    const downloadURL: any = (await soundTask.then(async (f) => {
      return f.ref.getDownloadURL()
    }));

    this.startUpload = false;

    return {
      key: id,
      filename: soundPath,
      name: file.name,
      downloadUrl: downloadURL,
      fileType: file.type,
      type: fileType,
      fileSize: file.size,
    };
  }

  @action
  async deleteRefFromFirebase(basePath: string, imagePath: string) {
    await this.storage.ref(imagePath).delete();
    // Promise.all(this.resolutions.map(async (item) => {
    //   const name = this.replacePrefix(basePath, this.removeFileExtension(imagePath));
    //   const ext = this.getFileExtension(imagePath);
    //   await this.storage.ref(`/${basePath}/thumbs/${name}${item}.${ext}`).delete();
    //   return Promise.resolve();
    // }))
    return;
  }

  getFileExtension(filename: string) {
    return filename.split('.').pop();
  }

  removeFileExtension(filename: string) {
    const extension = filename.split('.').pop();
    return filename.replace(`.${extension}`, '');
  }

  replacePrefix(basePath: string, filename: string) {
    return filename.replace(`/${basePath}/`, '');
  }

  // --------------------------------------------------------------------------------------------------------

  @observable public task: AngularFireUploadTask;
  @observable public percentage: number = 0;
  @observable public percentage_current: number = 0;
  @observable public is_success: boolean = false;

  resetUploaded() {
    this.task = null;
    this.percentage = 0;
    this.percentage_current = 0;
    this.is_success = false;
    this.startUpload = false;
  }

  async uploadFilesToFirebase(files: Array<File>, basePath: string) {
    let uploadedFiles: Array<any> = [];
    this.startUpload = true;
    for (let index = 0; index < files.length; index++)
      await this.uploadFileToFirebase(files[index], basePath, files.length).then(uplodedFile => uploadedFiles.push(uplodedFile));
    this.startUpload = false;
    this.resetUploaded();
    return uploadedFiles;
  }

  async uploadFileToFirebase(item: File, basePath: string, totalFile: number) {
    const filePath = `${basePath}/${Date.now()}_${item.name}`;
    const storageRef = this.storage.ref(filePath);

    this.task = this.storage.upload(filePath, item);

    this.task.percentageChanges().subscribe((percentage) => {
      percentage = percentage || 0;

      if (percentage == 100 && this.is_success === true) return;

      this.is_success = false;
      this.percentage_current = percentage / totalFile;

      if (percentage == 100) {
        this.is_success = true;
        this.percentage_current = 0;
        this.percentage += 100 / totalFile;
      }
    });

    return new Promise<any>((resolve, reject) => {
      this.task.then((f) => {
        f.ref.getDownloadURL().then((downloadURL) => {
          resolve({
            fileName: item.name,
            fileSize: item.size,
            fileType: item.type,
            imageDownloadURL: downloadURL,
            imageFilePath: filePath
          });
        }).catch(e => reject(e))
      });
    })
  }

  async uploadVoiceToFirebase(item: any) {
    const filePath = `chat/audios/${pageKey()}_sound`;
    const storageRef = this.storage.ref(filePath);

    this.task = this.storage.upload(filePath, item);

    this.task.percentageChanges().subscribe((percentage) => {
      percentage = percentage || 0;
    });

    const f = await this.task;
    const downloadURL = await f.ref.getDownloadURL();

    return {
      fileSize: item?.size,
      fileType: item?.type,
      fileName: 'sound',
      filename: filePath,
      key: this.ds.createId(),
      name: 'sound',
      type: 'audio',
      downloadURL: downloadURL,
      // downloadPath: filePath
    };
  }

}
