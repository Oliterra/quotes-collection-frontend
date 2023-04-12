import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthorVO} from "../model/vo/project.vo";
import {AppConstants} from "../model/app-constants";

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  private readonly AUTHOR_URL: string = 'authors';

  constructor(private http: HttpClient) {
  }

  public getAllAuthors(): Observable<AuthorVO[]> {
    return this.http.get<AuthorVO[]>(`${AppConstants.API_URL}/${this.AUTHOR_URL}`);
  }
}
