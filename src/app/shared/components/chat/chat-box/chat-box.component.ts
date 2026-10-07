import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, OnDestroy, SimpleChanges, ChangeDetectorRef, AfterContentChecked, AfterContentInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AudioRecorderService } from 'src/app/shared/services/audio-recorder.service';
import { Subscription } from 'rxjs';
import { ChatTypeEnum } from 'src/app/dummy/chat';
import { IChat } from 'src/app/interfaces/chat';
import { IChatRoom, IMessage } from 'src/app/interfaces/conversation';
import { ConvertService, orderBy, pushToArray } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';
import { FirestorageFilesUploadService } from 'src/app/shared/services/firestorage-files-upload.service';
import { FireStorageService, transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ChatStore } from 'src/app/stores/chat.store';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChatBoxComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {

  @ViewChild('scrollFrame') scrollFrame: ElementRef;
  @ViewChild('message') message: ElementRef;

  @Input() chatBoxData: any;
  @Input() chatBoxIndex: number;

  toUserData: any = null;
  fromUserData: any = null;
  chats: Array<any> = [];

  form: UntypedFormGroup;
  type: string = ChatTypeEnum.text;

  userId: string = null;
  isClicked: boolean = false;

  loading: boolean = false;
  fetching: boolean = false;

  MESSAGE_TYPE_ENUM: any = ChatTypeEnum;
  selectedMessageType: string = 'text';

  scrollSuccessful = false;
  fetchMore: boolean = false;
  lastVisible: any = null;
  lastMessages: IMessage = null;

  constructor(
    public chatStore: ChatStore,
    private authStore: AuthStore,
    public storage: FireStorageService,
    private fb: UntypedFormBuilder,
    private ds: DataService,
    private uploadService: FirestorageFilesUploadService,
    private audioRecorderService: AudioRecorderService,
    private changeRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: [null]
    });
    this.audioRecorderService.recorderError.subscribe(recorderErrorCase => {
    })
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  contactRoomChatMessagesRef: Subscription;

  async getChats(roomKey: string) {
    try {
      if (!roomKey) {
        this.loading = true;
        this.contactRoomChatMessagesRef && this.contactRoomChatMessagesRef.unsubscribe()
        this.contactRoomChatMessagesRef && this.contactRoomChatMessagesRef.unsubscribe()
        const chatRoom = await this.chatStore.fetchPersonalRoom(this.authStore.uid, this.chatBoxData?.receiver?.key);
        if (!chatRoom) {
          this.chatStore.newRoom(this.authStore.profile, this.chatBoxData?.receiver, this.chatBoxData?.roomType, (status, data) => {
            this.chatBoxData.room = data;
            if (status) {
              this.contactRoomChatMessagesRef = this.ds.contactRoomChatMessagesRef(data?.roomKey, ref => ref.orderBy('created_at', 'desc').limit(15)).valueChanges().subscribe((chats: Array<IChat>) => {
                this.chats = orderBy(chats?.map((docMessage: any) => {
                  let docFiles: any;
                  if (this.lastMessages?.key === docMessage?.key) {
                    docFiles = this.lastMessages?.files || []
                  }
                  else {
                    docFiles = docMessage?.files?.map(file => {
                      return { ...file, downloadUrl: file?.type === "image" && file?.downloadUrl ? transformImageSameTokenNo(file?.downloadUrl, '400').uri : file.downloadUrl }
                    }) || [];
                  }
                  return { ...docMessage, files: docFiles, dateChat: docMessage?.created_at?.toDate() };
                }), "dateChat");
                if (chats.length === 15) this.lastVisible = chats[chats.length - 1]
                else this.lastVisible = null;

                this.message?.nativeElement?.focus()
                this.loading = false;
              });
            }
          });
        } else {
          this.chatBoxData.room = chatRoom;
          this.contactRoomChatMessagesRef && this.contactRoomChatMessagesRef.unsubscribe()
          this.contactRoomChatMessagesRef = this.ds.contactRoomChatMessagesRef(chatRoom?.roomKey, ref => ref.orderBy('created_at', 'desc').limit(15)).valueChanges().subscribe((chats: Array<IChat>) => {
            this.chats = orderBy(chats?.map((docMessage: any) => {
              let docFiles: any;
              if (this.lastMessages?.key === docMessage?.key) {
                docFiles = this.lastMessages?.files || []
              }
              else {
                docFiles = docMessage?.files?.map(file => {
                  return { ...file, downloadUrl: file?.type === "image" && file?.downloadUrl ? transformImageSameTokenNo(file?.downloadUrl, '400').uri : file.downloadUrl }
                }) || [];
              }
              return { ...docMessage, files: docFiles, dateChat: docMessage?.created_at?.toDate() };
            }), "dateChat");
            if (chats.length === 15) this.lastVisible = chats[chats.length - 1]
            else this.lastVisible = null;
            this.message?.nativeElement?.focus()
            this.loading = false;
          });
        }
      } else {
        this.loading = true;
        this.contactRoomChatMessagesRef && this.contactRoomChatMessagesRef.unsubscribe()
        this.contactRoomChatMessagesRef = this.ds.contactRoomChatMessagesRef(roomKey, ref => ref.orderBy('created_at', 'desc').limit(15)).valueChanges().subscribe((chats: Array<IChat>) => {
          this.chats = orderBy(chats?.map((docMessage: any) => {
            let docFiles: any;
            if (this.lastMessages?.key === docMessage?.key) {
              docFiles = this.lastMessages?.files || []
            }
            else {
              docFiles = docMessage?.files?.map(file => {
                return { ...file, downloadUrl: file?.type === "image" && file?.downloadUrl ? transformImageSameTokenNo(file?.downloadUrl, '400').uri : file.downloadUrl }
              }) || [];
            }
            return { ...docMessage, files: docFiles, dateChat: docMessage?.created_at?.toDate() };
          }), "dateChat");
          if (chats.length === 15) this.lastVisible = chats[chats.length - 1]
          else this.lastVisible = null;

          this.message?.nativeElement?.focus()
          this.loading = false;
        });
      }
    } catch (error) {
    }
  }

  async onScroll(event) {
    const chatRoom = this.chatBoxData.room;
    if (!this.lastVisible || this.fetchMore || this.scrollFrame.nativeElement.scrollTop !== 0 || !chatRoom) return;
    this.fetchMore = true;
    const created_at = this.lastVisible?.created_at;
    const items = await this.ds.contactRoomChatMessagesRef(chatRoom?.roomKey, ref => ref.orderBy('created_at', 'desc').startAfter(created_at).limit(15)).get().toPromise()
    const chats: Array<IChat> = pushToArray(items);
    const data = (orderBy(chats?.map((doc: any) => {
      const docFiles = doc?.files?.map(file => {
        return { ...file, downloadUrl: file?.type === "image" ? transformImageSameTokenNo(file?.downloadUrl, '400').uri : file.downloadUrl }
      }) || [];
      return { ...doc, dateChat: doc?.created_at?.toDate(), files: docFiles }
    }), "dateChat") as any[])
    if (data.length >= 15) this.lastVisible = chats[chats.length - 1]
    else this.lastVisible = null;
    this.chats = data.concat(this.chats)
    this.fetchMore = false;
  }

  ngAfterViewInit(): void {
    this.userId = this.authStore.uid;
    const currentValue = this.chatBoxData || null;
    let roomKey = currentValue?.key;
    if (this.chatBoxData?.newRoom) {
      roomKey = this.chatBoxData?.roomKey || null
    }
    this.getChats(roomKey);
    this.toUserData = currentValue?.receiver;
    this.fromUserData = this.chatStore.mapProfile(this.authStore.employee);
  }

  ngAfterViewChecked(): void {
    this.changeRef.detectChanges();
    if (!this.scrollSuccessful) {
      this.scrollSuccessful = this.scrollToBottom(this.scrollFrame);
    }
  }

  ngOnDestroy(): void {
    this.contactRoomChatMessagesRef && this.contactRoomChatMessagesRef.unsubscribe()
  }


  getCurrentDate() {
    return new Date();
  }

  btnCloseClicked(item: any, chatBoxIndex: number) {
    this.chatStore.closeConversation(item);
  }

  btnAddMoreClicked() {
    this.isClicked = !this.isClicked;
    if (!this.isClicked) {
      this.interval = null;
      this.progressValue = 0;
      this.recordedVoice = null;
      this.selectedMessageType = this.MESSAGE_TYPE_ENUM.text;
    };
  }

  // start of voice recording ----------------------------------------------------------------------------------------------

  interval;
  progressValue = 0;
  textboxProgressValue = 0;

  starProgress(secondInterval) {
    const lengthForOnePct = 204 / 60;
    this.interval = setInterval(() => {
      this.progressValue += 1;
      this.textboxProgressValue = parseFloat((this.progressValue * lengthForOnePct).toFixed(2));

      if (this.progressValue == 60) {
        this.stopRecording();
        this.isRecording = false;
        clearInterval(this.interval);
      }
    }, secondInterval)
  }

  convertSecondsToMinutesAndSeconds(seconds: number) {
    var minute = Math.floor(this.progressValue / 60);
    var second: any = seconds - minute * 60;
    second = second <= 10 ? '0' + second : second;
    return `${minute}:${second}`;
  }

  recordedVoice: any = null;
  isRecording: boolean = false;

  btnRecordAndStopClicked() {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      this.startRecording();
      this.progressValue = 0;
      this.starProgress(1000);
    } else {
      this.stopRecording();
      this.isRecording = false;
      clearInterval(this.interval);
    }
  }

  startRecording() {
    this.audioRecorderService.startRecording();
  }

  stopRecording() {
    this.audioRecorderService.stopRecording().then((output) => {
      this.recordedVoice = output;
      // const recordedVoice = "data:audio/webm;base64," + output;
    }).catch(errorCase => {
    });
  }

  getRecorderState() {
    const result = this.audioRecorderService.getRecorderState().toString();
  }

  // end of voice recording ------------------------------------------------------------------------------------------------

  async btnSendClicked(f: any) {
    if (this.form.invalid) return;
    this.form.disable()
    const key: string = this.ds.createId();
    const roomKey = this.chatBoxData?.room?.roomKey;
    const sender = this.chatStore.mapProfile(this.authStore.employee);
    let { message } = f
    let messageType = this.MESSAGE_TYPE_ENUM.text;
    let files: any[] = [];
    if (this.MESSAGE_TYPE_ENUM.voice === this.selectedMessageType) {
      messageType = this.MESSAGE_TYPE_ENUM.voice;
      const audios = await this.uploadService.uploadVoiceToFirebase(this.recordedVoice);
      files.push(audios)
    }
    const messageData: IMessage = {
      key: key,
      created_at: this.ds.serverTimestamp(),
      isDelete: false,
      message: message,
      files: files || [],
      sender: sender,
      seenBys: [],
      type: messageType,
      sending: 'send',
      date: ConvertService.toDateKey(new Date()),
    };
    const room: IChatRoom = {
      key: roomKey,
      last_message: messageData,
      last_message_at: this.ds.serverTimestamp(),
      last_seen_by: [],
    };
    this.chatStore.sendMessage(room, messageData, (status, error) => {
      this.form.enable()
      if (status) {
        this.form.reset()
      }
    });
  }

  scrollToBottom(element: ElementRef): boolean {
    try {
      element.nativeElement.scroll({
        top: element.nativeElement.scrollHeight,
        left: 0, behavior: 'smooth'
      });
      element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
      return element.nativeElement.scrollTop !== 0;
    } catch (err) {
    }
  }

  onSelectedFile = async (event) => {
    this.selectedMessageType = ChatTypeEnum.attachmentFile;
    await this.onSaveUploadFile(event);
  }

  onSelectedFileImages = async (event) => {
    this.selectedMessageType = ChatTypeEnum.image;
    await this.onSaveUploadFile(event);
  }

  onSelectedFileVideo = async (event) => {
    this.selectedMessageType = ChatTypeEnum.video;
    await this.onSaveUploadFile(event);
  }

  messageTypeClicked(type: string) {
    this.isClicked = !this.isClicked;
    this.selectedMessageType = type;
  }

  messageClicked(type: string) {
    this.isClicked = false;
    this.selectedMessageType = type;
  }

  onSaveUploadFile = async (event) => {
    if (event && event.target.files.length > 0) {
      const selectedFiles: any[] = [];
      for await (const file of event.target.files) {
        selectedFiles.push(file)
      }
      this.form.disable()
      const key: string = this.ds.createId();
      const roomKey = this.chatBoxData?.room?.roomKey;
      const sender = this.chatStore.mapProfile(this.authStore.employee);
      const files = await this.storage.upload(selectedFiles);
      const messageData: IMessage = {
        key: key,
        created_at: this.ds.serverTimestamp(),
        isDelete: false,
        message: null,
        files: files || [],
        sender: sender,
        seenBys: [],
        type: this.selectedMessageType || null,
        sending: 'send',
        date: ConvertService.toDateKey(new Date()),
      };
      const room: IChatRoom = {
        key: roomKey,
        last_message: messageData,
        last_message_at: this.ds.serverTimestamp(),
        last_seen_by: [],
      };
      this.lastMessages = messageData;
      this.chatStore.sendMessage(room, messageData, (status, error) => {
        this.form.enable()
        if (status) {
          this.form.reset()
          this.isClicked = false;
        }
      });
    }
  }
}
