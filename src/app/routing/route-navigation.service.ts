import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RouteNavigationService {

    public static readonly MY_QUOTES_URL: string = 'my-quotes';
    public static readonly SEARCH_QUOTES_URL: string = 'search-quotes';
    public static readonly LIBRARY_URL: string = 'library';
}
