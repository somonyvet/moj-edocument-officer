import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ChatStore } from 'src/app/stores/chat.store';

@Component({
    selector: 'app-chat-boxes',
    templateUrl: './chat-boxes.component.html',
    styleUrls: ['./chat-boxes.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChatBoxesComponent implements OnInit {

  constructor(
    public chatStore: ChatStore,
  ) { }

  ngOnInit(): void { }

}
