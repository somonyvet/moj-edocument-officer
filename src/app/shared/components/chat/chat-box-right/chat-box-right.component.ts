import { Component, Input, OnInit } from '@angular/core';
import { Track } from 'ngx-audio-player';
import { ChatTypeEnum } from 'src/app/dummy/chat';

@Component({
  selector: 'app-chat-box-right',
  templateUrl: './chat-box-right.component.html',
  styleUrls: ['./chat-box-right.component.scss']
})
export class ChatBoxRightComponent implements OnInit {

  @Input() type: string;
  @Input() value: any;
  @Input() index: number;
  @Input() dateTime: Date;
  @Input() userData: any;
  @Input() status: string;
  @Input() photoURL: string;
  @Input() files: any[];

  CHAT_TYPE_ENUM = ChatTypeEnum;
  msaapPlaylist: Track[] = [];
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
      this.msaapPlaylist.push({
        title: 'Audio One Title',
        link: value?.downloadURL || value?.downloadUrl,
        artist: 'Artist',
        duration: value.duration
      });
    }
  }


  chatClicked() {
    this.isClicked = !this.isClicked;
  }

  onEnded(event) {

  }

}
