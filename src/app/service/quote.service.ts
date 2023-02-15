import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuoteVO } from '../model/vo/project.vo';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private apiUrl: string = 'http://localhost:8080/';
  private quoteUrl: string = 'quote';

  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<QuoteVO[]> {
    return this.http.get<QuoteVO[]>(this.apiUrl + this.quoteUrl);
  }

}
