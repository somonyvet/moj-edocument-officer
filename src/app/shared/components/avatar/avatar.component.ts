import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { ImageSizeType } from '../../services/fire-storage.service';
import { transformImageSameTokenNo } from '../../services/fireStorage.service';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() filename: string;
  @Input() size: ImageSizeType;
  @Input() uri: string;

  url: string = PHOTO_LIB.EMPTY_AVATAR;
  loading: boolean = true;
  constructor() { }

  async ngOnInit(): Promise<void> {
    if (this.uri) {
      this.url = this.uri;
      this.loading = false;
      return;
    }
    this.url = this.filename ? transformImageSameTokenNo(this.filename, this.size).uri : PHOTO_LIB.EMPTY_AVATAR;
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filename && !this.url) {
      const filename = changes.filename.currentValue;
      this.url = filename ? transformImageSameTokenNo(filename, this.size).uri : PHOTO_LIB.EMPTY_AVATAR;
    }
  }

  handleImgError(ev: any, item: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }
}
