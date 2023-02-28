import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-menu-sidebar',
    templateUrl: './menu-sidebar.component.html',
    styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent {

    public isHidden: boolean = false;
    public locales: string[] = environment.locales;

    constructor(private translateService: TranslateService) {
        this.translateService = translateService;
    }

    public show(): void {
        this.isHidden = false;
    }

    public hide(): void {
        this.isHidden = true;
    }

    public setLocale(locale: string): void {
        this.translateService.use(locale);
    }
}
