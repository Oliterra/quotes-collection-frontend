import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppConstants} from "../model/app-constants";
import {HttpClient} from "@angular/common/http";
import {GroupVO} from "../model/vo/project.vo";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private readonly GROUP_URL: string = 'groups';
  private readonly USER_URL: string = 'user';

  constructor(private http: HttpClient) {
  }

  public getAllGroups(): Observable<GroupVO[]> {
    return this.http.get<GroupVO[]>(`${AppConstants.API_URL}/${this.GROUP_URL}`);
  }

  public getUserGroups(userId: number): Observable<GroupVO[]> {
    return this.http.get<GroupVO[]>(`${AppConstants.API_URL}/${this.GROUP_URL}/${this.USER_URL}/${userId}`);
  }
}
