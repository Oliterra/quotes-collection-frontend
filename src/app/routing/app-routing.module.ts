import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RouteNavigationService} from './route-navigation.service';
import {QuoteListComponent} from "../component/quote-list/quote-list.component";
import {LibraryComponent} from "../component/library/library.component";

const routes: Routes = [
  {
    path: '',
    component: QuoteListComponent,
    data: {
      isUserQuotes: false
    }
  },
  {
    path: RouteNavigationService.MY_QUOTES_URL,
    component: QuoteListComponent,
    data: {
      isUserQuotes: true
    }
  },
  {
    path: RouteNavigationService.SEARCH_QUOTES_URL,
    component: QuoteListComponent,
    data: {
      isUserQuotes: false
    }
  },
  {
    path: RouteNavigationService.LIBRARY_URL,
    component: LibraryComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
