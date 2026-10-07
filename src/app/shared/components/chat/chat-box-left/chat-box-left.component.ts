import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ChatTypeEnum } from 'src/app/dummy/chat';

@Component({
    selector: 'app-chat-box-left',
    templateUrl: './chat-box-left.component.html',
    styleUrls: ['./chat-box-left.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChatBoxLeftComponent implements OnInit {

  @Input() type: string;
  @Input() value: any;
  @Input() index: number;
  @Input() dateTime: Date;
  @Input() userData: any;
  @Input() status: string;
  @Input() photoURL: string;
  @Input() files: any[];

  CHAT_TYPE_ENUM = ChatTypeEnum;
  audioUrl: string;
  fileAudio: any[] = [];
  fileImages: any[] = [];
  isClicked: boolean = false;

  constructor() { }

  ngOnInit(): void {
    const fileAudio = this.files?.filter(m => m?.type === 'audio');
    this.fileAudio = fileAudio;
    const fileImages = this.files?.filter(m => m?.type === 'image');
    this.fileImages = fileImages;

    if (fileAudio?.length > 0) {
      const value = fileAudio[fileAudio.length - 1]
      this.audioUrl = value?.downloadURL || value?.downloadUrl;
    }
  }

  chatClicked() {
    this.isClicked = !this.isClicked;
  }

}
