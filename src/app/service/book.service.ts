import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BookVO} from "../model/vo/project.vo";
import {AppConstants} from "../model/app-constants";

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly BOOK_URL: string = 'books';

  constructor(private http: HttpClient) {
  }

  public getAllBooks(): Observable<BookVO[]> {
    return this.http.get<BookVO[]>(`${AppConstants.API_URL}/${this.BOOK_URL}`);
  }
}
