import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouteNavigationService {

  public static readonly MY_QUOTES_URL: string = 'my-quotes';
}
