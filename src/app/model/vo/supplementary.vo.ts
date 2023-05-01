import {QuoteMainInfoVO} from "./project.vo";

export class QuoteListVO {
  public count: number;
  public quotes: QuoteMainInfoVO[];
}

export class QuoteFilterVO {
  public bookId: number;
  public authorId: number;
  public categoryIds: number[] = [];
  public text: string;
  public tagIds: number[] = [];
  public isSearch: boolean;
}

export class BookFilterVO {
  public bookId: number;
  public authorId: number;
  public userId: number;
  public categoryIds: number[] = [];
}
