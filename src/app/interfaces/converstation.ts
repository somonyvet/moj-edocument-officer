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
