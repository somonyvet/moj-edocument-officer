export interface IConversation {
  key: string;
  isDeleted: boolean;
  isPublished: boolean;
  createdAt: any;
  createdBy: any;
  updatedAt: any;
  updatedBy: any;
  deletedBy: any;
  deletedAt: any;
  dateKey: any;
  pageKey: any;
  keyword: any;

  involvedPeople: Array<any>;
  involvedPeopleKey: Array<string>;
  involvedPeopleCombinedKey: Array<string>;
  latestConDateTime: Date;
  latestConType: string,
  latestConValue: string;
  latestConStatus: string;
  latestConPerson: any;
}


export interface IMessage {
  key: string;
  created_at: any;
  isDelete: boolean;
  files?: any[];
  message: string;
  sender: any;
  seenBys: any[];
  type: any;
  sending:string;
  date:number;
}

export interface IChatRoom {
  key: string;
  contactKeys?: any[];
  last_message: any;
  last_message_at: any;
  last_seen_by?: any[];
  private_key?: string;
  room_type?: any;
}