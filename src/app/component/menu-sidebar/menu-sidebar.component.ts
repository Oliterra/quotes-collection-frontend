import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {RouteNavigationService} from "../../routing/route-navigation.service";

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent {

  public readonly myQuotesUrl: string = RouteNavigationService.MY_QUOTES_URL;
  public readonly searchQuotesUrl: string = RouteNavigationService.SEARCH_QUOTES_URL;
  public isHidden: boolean = false;
  public locales: string[] = environment.locales;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private translateService: TranslateService) {
    this.translateService = translateService;
  }

  public show(): void {
    this.isHidden = false;
  }

  public hide(): void {
    this.isHidden = true;
  }

  public isActiveRoute(url: string): boolean {
    return this.activatedRoute.snapshot.routeConfig.path === url;
  }

  public goToMyQuotes(): void {
    this.router.navigate([this.myQuotesUrl], {replaceUrl: true});
  }

  public goToSearchQuotes(): void {
    this.router.navigate([this.searchQuotesUrl], {replaceUrl: true});
  }

  public setLocale(locale: string): void {
    this.translateService.use(locale);
  }
}
