import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {TagVO} from "../model/vo/project.vo";
import {AppConstants} from "../model/app-constants";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  private readonly TAG_URL: string = 'tags';

  constructor(private http: HttpClient) {
  }

  public getAllTags(): Observable<TagVO[]> {
    return this.http.get<TagVO[]>(`${AppConstants.API_URL}/${this.TAG_URL}`);
  }
}
