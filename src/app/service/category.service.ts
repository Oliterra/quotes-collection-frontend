import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CategoryVO} from "../model/vo/project.vo";
import {AppConstants} from "../model/app-constants";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly CATEGORY_URL: string = 'categories';

  constructor(private http: HttpClient) {
  }

  public getAllCategories(): Observable<CategoryVO[]> {
    return this.http.get<CategoryVO[]>(`${AppConstants.API_URL}/${this.CATEGORY_URL}`);
  }
}
