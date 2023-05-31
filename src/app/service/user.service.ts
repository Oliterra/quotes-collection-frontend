import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppConstants} from "../model/app-constants";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly USER_URL: string = 'users';
  private readonly QUOTE_RATING_URL: string = 'quoteRating';

  constructor(private cookieService: CookieService,
              private http: HttpClient) {
  }

  public get currentUserId(): number {
    const storedUserId = this.cookieService.get('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  }

  public set currentUserId(value: number) {
    this.cookieService.set('userId', value.toString());
  }

  public get isUserLoggedIn(): boolean {
    return Boolean(this.currentUserId);
  }

  public getRatingByUserId(userId: number, quoteId: number): Observable<number> {
    let httpParams: HttpParams = new HttpParams();
    if (quoteId) {
      httpParams = httpParams.append('quoteId', quoteId.toString());
    }
    const requestOptions = {
      params: httpParams
    };
    return this.http.get<number>(`${AppConstants.API_URL}/${this.USER_URL}/${this.QUOTE_RATING_URL}/${userId}`, requestOptions);
  }
}
