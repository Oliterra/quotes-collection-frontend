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
}
