import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CHAT_ROOM_TYPE_OBJ } from 'src/app/dummy/chat';
import { AuthStore } from 'src/app/stores/auth.store';
import { ChatStore } from 'src/app/stores/chat.store';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-officer-profile-list',
  templateUrl: './officer-profile-list.component.html',
  styleUrls: ['./officer-profile-list.component.scss']
})
export class OfficerProfileListComponent implements OnInit {

  NO_AVATAR =  'https://firebasestorage.googleapis.com/v0/b/school-link-bb0e9.appspot.com/o/avatar_chat%2Fno_avatar.jpeg?alt=media&token=d1254692-33c5-41d4-80a1-d1f6040c217c'

  @Input() index: any;
  @Input() item: any;
  @Input() status: any;
  @Input() hidePhone: boolean;

  @Output() onChart = new EventEmitter();

  // item: any;
  presence$: any;
  subscribeRef: Subscription;

  constructor(
    private auth: AuthStore,
    public chatStore: ChatStore,
    public presence: PresenceService,
  ) { }

  ngOnInit() {
    this.presence$ = this.presence.getPresence(this.item.key);
  }

  ngOnDestroy() {
    this.subscribeRef && this.subscribeRef.unsubscribe()
  }

  onOpenChart(profile) {
    if (profile.key === this.auth.uid) return;
    this.chatStore.openConversation(profile, null,CHAT_ROOM_TYPE_OBJ.PRIVATE);
  }

}
