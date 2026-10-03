import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

export interface IFile {
  key: string;
  filename: string;
  name: string;
  downloadUrl: string;
  downloadURL: string;
  fileType: string;
  type: string;
  fileSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  uploadPercent: any = null;
  fileUrl:any=null;
  constructor(private storage: AngularFireStorage) { }

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
    const fileUrl =await ref.getDownloadURL().toPromise();
    return {
      uploadTask:task,
      fileUrl:fileUrl,
    };
  }

  storageRef(filePath) {
    return this.storage.ref(filePath);
  }


}



export type ImageSizeType = '200' | '400' | '680' | '720' | '1024' | '1280' | '1920'

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
  const ext = pathUrl.replace(urlWithoutExt, '') || '';
  const imgSize = size ? `_${size}x${size}` : ''
  const name = `${imgname}${imgSize}${ext}`
  return [path, name]
}