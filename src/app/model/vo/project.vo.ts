export class AuthorVO {
  public id: number;
  public name: string;
}

export class BookVO {
  public id: number;
  public name: string;
  public author: AuthorVO;
}

export class CategoryVO {
  public id: number;
  public name: string;
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
  public book: BookVO;
  public text: string;
  public rating: number;
  public isPublic: boolean;
  public groups: GroupVO[];
  public tags: TagVO[];
}

export class TagVO {
  public id: number;
  public name: string;
}

export class UserQuoteRatingVO {
  public userId: number;
  public quoteId: number;
  public rating: number;
}
