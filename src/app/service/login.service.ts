import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AppConstants} from "../model/app-constants";
import {AuthorizationInfoVO, RegistrationInfoVO} from "../model/vo/supplementary.vo";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly LOGIN_URL: string = 'login';
  private readonly SIGN_UP_URL: string = 'signUp';
  private readonly SIGN_IN_URL: string = 'signIn';

  constructor(private http: HttpClient) {
  }

  public signUp(registrationInfo: RegistrationInfoVO): Observable<number> {
    return this.http.post<number>(`${AppConstants.API_URL}/${this.LOGIN_URL}/${this.SIGN_UP_URL}`, registrationInfo);
  }

  public signIn(authorizationInfo: AuthorizationInfoVO): Observable<number> {
    return this.http.post<number>(`${AppConstants.API_URL}/${this.LOGIN_URL}/${this.SIGN_IN_URL}`, authorizationInfo);
  }
}
