import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BookVO, CategoryVO} from "../model/vo/project.vo";
import {AppConstants} from "../model/app-constants";
import {BookFilterVO} from "../model/vo/supplementary.vo";

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly CATEGORIES_SEPARATOR: string = ', ';
  private readonly BOOK_URL: string = 'books';
  private readonly FILTER_URL: string = 'filter';

  private _bookFilter: BookFilterVO;

  constructor(private http: HttpClient) {
  }

  public get bookFilter(): BookFilterVO {
    return this._bookFilter;
  }

  public set bookFilter(value: BookFilterVO) {
    this._bookFilter = value;
  }

  public resetBookFilter(): void {
    this._bookFilter = null;
  }

  public getBookCategories(book: BookVO): string {
    let categories: string = '';
    book.categories.forEach((category: CategoryVO, index: number) => {
      categories += category.name;
      if (index < book.categories.length - 1) {
        categories += this.CATEGORIES_SEPARATOR;
      }
    });
    return categories;
  }

  public getAllBooks(): Observable<BookVO[]> {
    return this.http.get<BookVO[]>(`${AppConstants.API_URL}/${this.BOOK_URL}`);
  }

  public getFilteredBooks(bookFilter: BookFilterVO): Observable<BookVO[]> {
    return this.http.post<BookVO[]>(`${AppConstants.API_URL}/${this.BOOK_URL}/${this.FILTER_URL}`, bookFilter);
  }

  public createBook(book: BookVO): Observable<BookVO> {
    return this.http.post<BookVO>(`${AppConstants.API_URL}/${this.BOOK_URL}`, book);
  }

  public editBook(book: BookVO): Observable<BookVO> {
    return this.http.patch<BookVO>(`${AppConstants.API_URL}/${this.BOOK_URL}`, book);
  }
}
