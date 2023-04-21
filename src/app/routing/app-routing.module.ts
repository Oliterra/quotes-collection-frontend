import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RouteNavigationService} from './route-navigation.service';
import {QuoteListComponent} from "../component/quote-list/quote-list.component";

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
