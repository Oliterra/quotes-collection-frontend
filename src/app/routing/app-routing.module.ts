import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RouteNavigationService} from './route-navigation.service';
import {QuotesListComponent} from "../component/quotes-list/quotes-list.component";

const routes: Routes = [
  {
    path: '',
    component: QuotesListComponent,
    data: {
      isUserQuotes: false
    }
  },
  {
    path: RouteNavigationService.MY_QUOTES_URL,
    component: QuotesListComponent,
    data: {
      isUserQuotes: true
    }
  },
  {
    path: RouteNavigationService.SEARCH_QUOTES_URL,
    component: QuotesListComponent,
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
