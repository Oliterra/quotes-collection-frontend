import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from "../model/app-constants";
import {QuoteMainInfoVO, UserQuoteRatingVO} from "../model/vo/project.vo";
import {QuoteFilterVO, QuoteListVO} from "../model/vo/supplementary.vo";

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private readonly QUOTE_URL: string = 'quotes';
  private readonly PAGE_URL: string = 'page';
  private readonly FILTER_URL: string = 'filter';
  private readonly CREATE_URL: string = 'create';
  private readonly VISIBILITY_URL: string = 'visibility';
  private readonly RATING_URL: string = 'rating';

  private _quoteFilter: QuoteFilterVO;

  constructor(private http: HttpClient) {
  }

  public get quoteFilter(): QuoteFilterVO {
    return this._quoteFilter;
  }

  public set quoteFilter(value: QuoteFilterVO) {
    this._quoteFilter = value;
  }

  public resetQuoteFilter(): void {
    this._quoteFilter = null;
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

  public changeQuoteVisibility(id: number): Observable<QuoteMainInfoVO> {
    return this.http.patch<QuoteMainInfoVO>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.VISIBILITY_URL}/${id}`, null);
  }

  public putUserRating(userQuoteRating: UserQuoteRatingVO): Observable<number> {
    return this.http.put<number>(`${AppConstants.API_URL}/${this.QUOTE_URL}/${this.RATING_URL}`, userQuoteRating);
  }
}
