export interface IChat {
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
  conversationKey: string;

  status: string;
  type: string;
  value: string;
  dateTime: Date;
}
