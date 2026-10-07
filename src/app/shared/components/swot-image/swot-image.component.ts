import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IFile, transformImageSameTokenNo, ImageSizeType } from 'src/app/shared/services/fire-storage.service';

@Component({
    selector: 'app-swot-image',
    templateUrl: './swot-image.component.html',
    styleUrls: ['./swot-image.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SwotImageComponent implements OnInit, OnChanges {
  @Input() file: IFile;
  @Input() size: ImageSizeType;
  @Input() classStyle: any;
  @Output() onClick=new EventEmitter()

  URL: string = PHOTO_LIB.EMPTY;
  constructor() { }

  ngOnInit(): void {
    if (this.file?.downloadUrl || this.file?.downloadURL) {
      this.URL = transformImageSameTokenNo(this.file?.downloadUrl || this.file?.downloadURL, this.size).uri
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { file } = changes;
    if (file && file?.currentValue) {
      const value = file?.currentValue;
      if (value?.downloadUrl || value?.downloadURL) {
        this.URL = transformImageSameTokenNo(value?.downloadUrl || value?.downloadURL, this.size).uri
      } else {
        this.URL = PHOTO_LIB.EMPTY;
      }
    } else {
      this.URL = PHOTO_LIB.EMPTY;
    }
  }

  

}
