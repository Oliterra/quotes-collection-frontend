export class AuthorVO {
  public id: number;
  public name: string;
  public surname: string;
}

export class BookVO {
  public id: number;
  public name: string;
  public author: AuthorVO;
}

export class GroupVO {
  public id: number;
  public name: string;
  public isPublic: boolean;
}

export class QuoteMainInfoVO {
  public id: number;
  public userId: number;
  public username: string;
  public authorName: string;
  public bookId: number;
  public bookName: string;
  public text: string;
  public rating: number;
  public isPublic: boolean;
  public canBeAddedToGroup: boolean;
  public groups: GroupVO[];
  public tags: TagVO[];
}

export class TagVO {
  public id: number;
  public name: string;
}
