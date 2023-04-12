import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from "../model/app-constants";
import {QuoteMainInfoVO} from "../model/vo/project.vo";
import {QuoteFilterVO, QuoteListVO} from "../model/vo/supplementary.vo";

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private readonly QUOTE_URL: string = 'quotes';
  private readonly PAGE_URL: string = 'page';
  private readonly FILTER_URL: string = 'filter';
  private readonly CREATE_URL: string = 'create';

  constructor(private http: HttpClient) {
  }

  public getAllQuotesMainInfoPage(pageNumber?: number, pageSize?: number): Observable<QuoteListVO> {
    let httpParams: HttpParams = new HttpParams();
    if (pageNumber) {
      httpParams = httpParams.append('pageNumber', pageNumber.toString());
    }
    if (pageSize) {
      httpParams = httpParams.append('pageSize', pageSize.toString());
    }
    const requestOptions = {
      params: httpParams
    };
    return this.http.get<QuoteListVO>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.PAGE_URL}`, requestOptions);
  }

  public getUserQuotesMainInfoPage(userId: number, pageNumber?: number, pageSize?: number): Observable<QuoteListVO> {
    let httpParams: HttpParams = new HttpParams();
    if (pageNumber) {
      httpParams = httpParams.append('pageNumber', pageNumber.toString());
    }
    if (pageSize) {
      httpParams = httpParams.append('pageSize', pageSize.toString());
    }
    const requestOptions = {
      params: httpParams
    };
    return this.http.get<QuoteListVO>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.PAGE_URL}/${userId}`, requestOptions);
  }

  public getFilteredQuotes(quoteFilter: QuoteFilterVO): Observable<QuoteListVO> {
    return this.http.post<QuoteListVO>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.FILTER_URL}`, quoteFilter);
  }

  public createQuote(quoteMainInfo: QuoteMainInfoVO): Observable<void> {
    return this.http.post<void>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.CREATE_URL}`, quoteMainInfo);
  }
}
