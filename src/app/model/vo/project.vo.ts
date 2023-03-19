export class QuoteMainInfoVO {
  public id: number;
  public userId: number;
  public username: string;
  public authorName: string;
  public bookName: string;
  public text: string;
  public rating: number;
  public isPublic: boolean;
  public canBeAddedToGroup: boolean;
  public groupNames: string[];
  public tags: TagVO[];
}

export class TagVO {
  public id: number;
  public name: string;
}
