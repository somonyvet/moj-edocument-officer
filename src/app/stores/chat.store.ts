import { observable, action } from "mobx";
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";

import { DataService } from "../shared/services/data.service";
import { generateKeywords, pageKey } from "../shared/services/mapping.service";
import { ConvertService, orderByData, pushToArray, pushToObject } from "../shared/services/convert.service";

import { IChat } from "../interfaces/chat";
import { IOfficer } from "../interfaces/document/document.interface";

import { AuthStore } from "./auth.store";
import { ChatStatusEnum } from "../dummy/chat";

import { IChatRoom, IConversation, IMessage } from "../interfaces/conversation";
import { CHAT_ROOM_TYPE_OBJ } from "../dummy/chat";

@Injectable({ providedIn: 'root' })
export class ChatStore {

  @observable public isEmpty: boolean = false;
  @observable public process: boolean = false;
  @observable public loading: boolean = false;
  @observable public fetching: boolean = false;

  @observable public chat: IChat = null;
  @observable public chats: Array<IChat> = [];
  @observable public conversation: IConversation = null;
  @observable public conversations: Array<any> = [];
  @observable public selectedPeople: Array<any> = [];
  @observable chatRoom: any[] = [];
  @observable public selectedOfficers: Array<IOfficer> = [];

  constructor(
    private ds: DataService,
    private authStore: AuthStore,
    private afs: AngularFirestore
  ) { }

  // @action
  // async openConversation(item: any, callback?: () => void) {
  //   try {
  //     this.process = true;

  //     if (this.conversations.length >= 3) return;
  //     const isExist = this.conversations.some((jtem) => item.key === jtem.key);

  //     if (!isExist) {
  //       const conversation = await this.getConversation(this.authStore.employee, item);
  //       this.conversations.push({ ...item, conversation });
  //       this.selectedOfficers.push(item);
  //     }
  //   }
  // }

  @action
  async fetchPersonalRoom(senderKey: string, receiverKey: string) {
    const room = await this.ds.contactRoomsRef(ref => ref
      .where('ownerKey', '==', senderKey)
      .where('contactKeys', 'array-contains', receiverKey)
      .where('room_type.key', '==', CHAT_ROOM_TYPE_OBJ.PRIVATE.key)).get().toPromise();
    return room?.empty ? null : pushToArray(room)[0]
  }

  @action
  newRoom(sender: any, receiver: any, roomType: any, callback: (status: boolean, data: any) => void) {
    this.process = true;
    const batch = this.ds.batch();
    const roomKey = this.ds.createId();

    const roomSender = {
      key: `${roomKey}${sender?.key}`,
      status: 'offline',
      roomKey: roomKey,
      last_active_at: this.ds.serverTimestamp(),
      last_message_at: this.ds.serverTimestamp(),
      last_seen_at: this.ds.serverTimestamp(),
      ownerKey: sender?.key,
      senderKey: sender?.key,
      contactKeys: [sender?.key, receiver?.key],
      room_type: roomType,
    };

    const roomReceiver = {
      key: `${roomKey}${receiver?.key}`,
      status: 'offline',
      roomKey: roomKey,
      last_active_at: this.ds.serverTimestamp(),
      last_message_at: this.ds.serverTimestamp(),
      last_seen_at: this.ds.serverTimestamp(),
      ownerKey: receiver?.key,
      senderKey: sender?.key,
      contactKeys: [sender?.key, receiver?.key],
      room_type: roomType,
    };

    const chatRoom = {
      key: roomKey,
      contactKeys: [sender?.key, receiver?.key],
      last_message: null,
      last_message_at: this.ds.serverTimestamp(),
      private_key: `${sender?.key}${receiver?.key}`,
      room_type: roomType,
    };

    batch.set(this.ds.contactRoomsRef().doc(roomSender?.key).ref, roomSender, { merge: true });
    batch.set(this.ds.contactRoomsRef().doc(roomReceiver?.key).ref, roomReceiver, { merge: true });
    batch.set(this.ds.contactRoomChatRef().doc(chatRoom?.key).ref, chatRoom, { merge: true });

    batch.commit().then(() => {
      callback(true, chatRoom)
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    });
  }

  @action
  sendMessage(room: IChatRoom, message: IMessage, callback: (status: boolean, error: string) => void): void {
    this.process = true;
    const batch = this.ds.batch();
    batch.set(this.ds.contactRoomChatRef().doc(room.key).ref, room, { merge: true })
    batch.set(this.ds.contactRoomChatMessagesRef(room.key).doc(message.key).ref, message, { merge: true })
    batch.commit().then(() => {
      callback(true, null)
    }).catch((error) => {
      alert(error);
      callback(false, error)
    }).finally(() => {
      this.process = false;
    })
  }

  @action
  async openConversation(receiver: any, room: any, roomType: any) {
    try {
      this.process = true;
      let message: any = null;
      if (room) {
        const isExist = this.conversations.some((c) => room?.key === c?.room?.key);
        if (isExist) return;
        message = {
          ...room,
          receiver: this.mapProfile(receiver),
          room: room,
          key: room.key,
          index: this.chatRoom.length
        }
      } else {
        const isExist = this.conversations.some((c) => receiver?.key === c?.receiver?.key);
        if (isExist) return;
        const roomKey = room?.key || null;
        message = {
          receiver: this.mapProfile(receiver),
          key: receiver?.key,
          index: this.chatRoom.length,
          roomType: roomType,
          newRoom: true,
          room: room || null,
          roomKey: roomKey,
        }

        if (room) {
          message = {
            ...room,
            receiver: this.mapProfile(receiver),
            key: receiver?.key,
            index: this.chatRoom.length,
            roomType: roomType,
            newRoom: true,
            roomKey: roomKey,
            room: room || null,
          }
        }
      }

      this.chatRoom.push(message);
      this.conversations.push(message);
      // this.conversations.push(message);
      this.selectedPeople.push(message);

      this.chatRoom = orderByData(this.chatRoom, "index", "desc");
      this.conversations = orderByData(this.conversations, "index", "desc").slice(0, 3);
      this.selectedPeople = orderByData(this.selectedPeople, "index", "desc").slice(0, 3);

      this.process = false;
    } catch (error) {
    }
  }

  @action
  closeConversation(item: any, callback?: () => void) {
    try {
      this.process = true;

      const findIndex = this.conversations.findIndex((jtem) => item.key === jtem.key);
      if (findIndex >= 0) this.conversations.splice(findIndex, 1);

      this.process = false;
    } catch (error) {
    }
  }

  @action
  async getConversation(firstPerson: any, secondPerson: any) {
    try {
      this.loading = true;

      const firstPersonKey = firstPerson.key;
      const secondPersonKey = secondPerson.key;
      const keyList = [`${firstPersonKey}-${secondPersonKey}`, `${secondPersonKey}-${firstPersonKey}`];
      const conversation: Array<IConversation> = pushToArray(await this.ds.getConversationRef(keyList).get().toPromise());

      this.loading = false;
      return conversation.length === 0 ? null : conversation[0];
    } catch (error) {
    }
  }

  @action
  async getOfficer(empKey: string) {
    try {
      this.loading = true;
      const emp = pushToObject(await this.afs.collection('officers').doc(empKey).get().toPromise());
      this.loading = false;
      return emp;
    } catch (error) {
    }
  }

  @action
  async getChats(conversationKey: string) {
    try {
      this.loading = true;
      this.ds.getChats(conversationKey).valueChanges().subscribe((chats: Array<IChat>) => {
        this.chats = chats;
        this.loading = false;
      });
    } catch (error) {
    }
  }

  @action
  async createConversation(firstPerson: any, secondPerson: any, index: number, chatData: { type: string, value: string }): Promise<IConversation> {
    try {
      this.process = true;

      const key: string = this.ds.createId();
      const data: IConversation = {
        key,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        createdBy: firstPerson,
        updatedBy: null,
        deletedBy: null,
        dateKey: ConvertService.dateKey(),
        pageKey: ConvertService.pageKey(),
        isDeleted: false,
        isPublished: true,
        keyword: generateKeywords([chatData.value]),

        involvedPeople: [firstPerson, secondPerson],
        involvedPeopleKey: [
          firstPerson.key,
          secondPerson.key,
        ],
        involvedPeopleCombinedKey: [
          `${firstPerson.key}-${secondPerson.key}`,
          `${secondPerson.key}-${firstPerson.key}`
        ],
        latestConDateTime: new Date(),
        latestConType: chatData.type,
        latestConValue: chatData.value,
        latestConPerson: firstPerson,
        latestConStatus: ChatStatusEnum.sent,
      };

      await this.ds.conversationRef().doc(key).set(data);
      this.conversations[index] = { ...this.conversations[index], conversation: data };

      this.process = false;
      return data;
    } catch (error) {
    }
  }

  @action
  async updateConversation(existedData: IConversation, latestChatData: IChat) {
    try {
      this.process = true;

      const data: any = {
        updatedAt: new Date(),
        updatedBy: latestChatData.createdBy,
        dateKey: ConvertService.dateKey(),
        pageKey: ConvertService.pageKey(),
        keyword: generateKeywords([latestChatData.value]),

        latestConDateTime: latestChatData.dateTime,
        latestConType: latestChatData.type,
        latestConValue: latestChatData.value,
        latestConStatus: latestChatData.status,
        latestConPerson: latestChatData.createdBy,
      };

      await this.ds.conversationRef().doc(existedData.key).update(data);

      this.process = false;
    } catch (error) {
    }
  }

  @action
  async createChat(chatData: IChat) {
    try {
      this.process = true;
      await this.ds.chatRef(chatData.conversationKey).doc(chatData.key).set(chatData);
      this.process = false;
    } catch (error) {
    }
  }

  @action
  mapEmp(userData: any) {
    return {
      key: userData.key,
      displayName: userData?.displayName,
      firstName: userData?.first_name_en,
      lastName: userData?.last_name_en,
      photoURL: userData?.file?.downloadUrl,
      currentTitle: userData?.currentTitle,

      // role: userData.role,
      // position: userData.position,
      // company: userData.company,
      // department: userData.department,
      // generalDepartment: userData.generalDepartment,
      // currentDepartment: userData.currentDepartment,
    }
  }

  @action
  mapAccount(userData: any) {
    return {
      key: userData?.key,
      displayName: userData?.displayName,
      photoURL: userData?.fileUrl,
    };
  }

  @action
  mapProfile(profile: any) {
    return {
      key: profile.key,
      displayName: profile.displayName,
      full_name: profile?.full_name || profile?.displayName,
      photoURL: profile?.avatarUrl || profile?.file?.downloadUrl || profile?.fileUrl || null,
    };
  }

}
