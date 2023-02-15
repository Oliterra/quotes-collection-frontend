import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteNavigationService } from './route-navigation.service';
import { UserQuotesComponent } from '../component/user-quotes/user-quotes.component';

const routes: Routes = [
  {
    path: RouteNavigationService.MY_QUOTES_URL,
    component: UserQuotesComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
