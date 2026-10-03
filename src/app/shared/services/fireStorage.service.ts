import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { observable, action, } from 'mobx';
import { Observable } from 'rxjs';
import { ImageSizeType, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { DataService } from 'src/app/shared/services/data.service';
@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  fileUrl: string = null;

  loading: boolean = false;
  constructor(private storage: AngularFireStorage,
    private ds: DataService) { }



  async getDownloadUrlResizeImage(filename: string, size: string) {
    if (filename) {
      this.loading = true;
      const ext = filename.split('.').pop()
      const fPath = filename.split('/');
      const pathItems = fPath.slice(1, fPath.length - 1)
      const fileSplit = filename.split('.');
      const filePathName = fileSplit[0].split('/');
      const file_name = filePathName[filePathName.length - 1]
      let folderPath: string = '';
      pathItems.map(p => {
        folderPath = `${folderPath}/${p}`
      })
      folderPath = `${folderPath}/thumbs/${file_name}_${size}.${ext}`;
      const ref = this.storage.ref(folderPath);
      const imgUrl = await ref.getDownloadURL().toPromise().then(res => {
        return res
      }).catch(error => PHOTO_LIB.EMPTY_AVATAR)
      this.loading = false;
      return imgUrl
    }
    return PHOTO_LIB.EMPTY_AVATAR;
  }

  uploadFile(event, filePath) {
    const file = event.target.files[0];
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    return task;
  }

  uploadSelectedFile(file, filePath) {
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    return task
  }

  async uploadFileGetDownloadURL(file, filePath) {
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    const fileUrl = await ref.getDownloadURL().toPromise();
    return {
      uploadTask: task,
      fileUrl: fileUrl,
    };
  }

  storageRef(filePath: string) {
    return this.storage.ref(filePath);
  }

  @observable uploadPercent: Observable<number>;
  @observable startUpload: boolean = false;

  @action
  async upload(fileItems: any[]) {
    const selectedFiles: any[] = [];

    for await (const file of fileItems) {
      this.startUpload = true;
      const soundPath = `/files/${this.ds.createId()}${file.name}`;
      const soundTask = this.uploadSelectedFile(file, soundPath);

      this.uploadPercent = soundTask.percentageChanges();
      const downloadURL: any = (await soundTask.then(async (f) => {
        return f.ref.getDownloadURL()
      }));
      let fileType = file.type.split('/').slice(0, -1).join('/');
      const files = {
        key: this.ds.createId(),
        filename: soundPath,
        name: file.name,
        downloadUrl: downloadURL,
        fileType: file?.type,
        type: fileType,
        fileSize: file?.size || null,
      }

      selectedFiles.push(files)
      this.startUpload = false;
    }

    return selectedFiles
  }

  uploadSelectedBase64File(base64Data, filePath) {
    const ref = this.storage.ref(filePath);
    const task = ref.putString(base64Data, 'data_url');
    return task
  }

  // fileName: example.png
  // type: image
  // base64Data: data:image/png;base64,data........
  @action
  async uploadBase64(fileName: string, type: string, base64Data: string) {

    this.startUpload = true;
    const soundPath = `/files/${this.ds.createId()}${fileName}`;

    const soundTask = this.uploadSelectedBase64File(base64Data, soundPath);

    this.uploadPercent = soundTask.percentageChanges();
    const downloadURL: any = (await soundTask.then(async (f) => {
      return f.ref.getDownloadURL()
    }));
    const file = {
      key: this.ds.createId(),
      filename: soundPath,
      name: fileName,
      downloadUrl: downloadURL,
      fileType: type,
      type: type,
      fileSize: null,
    }

    this.startUpload = false;
    return file
  }




  @action
  async uploadMulti(fileItems: any[]) {
    const selectedFiles: any[] = [];

    for await (const item of fileItems) {
      this.startUpload = true;
      const soundPath = `/files/${this.ds.createId()}${item.file.name}`;
      const soundTask = this.uploadSelectedFile(item.file, soundPath);

      this.uploadPercent = soundTask.percentageChanges();
      const downloadURL: any = (await soundTask.then(async (f) => {
        return f.ref.getDownloadURL()
      }));
      let fileType = item.file.type.split('/').slice(0, -1).join('/');
      const files = {
        key: this.ds.createId(),
        filename: soundPath,
        name: item.file.name,
        downloadUrl: downloadURL,
        fileType: item.file?.type,
        type: fileType,
        fileSize: item.file?.size || null,
      }

      selectedFiles.push(files)
      this.startUpload = false;
    }

    return selectedFiles
  }


  async delete(fileItems: any[]) {
    for await (const file of fileItems) {
      this.storage.ref(file.filename).delete()
    }
  }

  async deleteFile(file: any) {
    this.storage.ref(file.filename).delete()
  }


}

export function transformImageSameTokenNo(uri: string, size: ImageSizeType) {
  const [pathUrl, token, rawPath] = UrlToPath(uri)
  const [path, name] = fileNameAddSize(pathUrl, size)
  const pathName = size ? `${path ? `${path}/` : ''}thumbs/${name}` : `${path ? `${path}/` : ''}${name}`
  const ref = encodeURIComponent(pathName)
  return { uri: `${rawPath}${ref}?${token}` }
}

export function UrlToPath(url: string) {
  const rawSplit = url?.split('/').pop()?.split('?')
  const rawPath = url.replace(url?.split('/').pop() ?? '', '')
  if (Array.isArray(rawSplit) && rawSplit.length > 0) {
    return [decodeURIComponent(rawSplit[0]), rawSplit[1], rawPath]
  }
  return ['', '', '']
}

export function fileNameAddSize(pathUrl: string, size?: ImageSizeType) {
  const imgname = pathUrl.split('/').pop()?.split('.').slice(0, -1).join('.') || pathUrl.split('/').pop() || ''
  const path = pathUrl.split('/').slice(0, -1).join('/')
  const urlWithoutExt = pathUrl.replace(/\.[^/.]+$/, '') || ''
  const ext = pathUrl.replace(urlWithoutExt, '') || ''
  const imgSize = size ? `_${size}x${size}` : ''
  const name = `${imgname}${imgSize}${ext}`
  return [path, name]
}
