import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MenuSidebarComponent} from './component/menu-sidebar/menu-sidebar.component';
import {AppRoutingModule} from './routing/app-routing.module';
import {MissingTranslationHandler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {MissingTranslationService} from './service/missing-translation.service';
import {PopoverModule} from 'ngx-bootstrap/popover';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QuoteListComponent} from "./component/quote-list/quote-list.component";
import {ngxLoadingAnimationTypes, NgxLoadingModule} from "ngx-loading";
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {AddQuoteComponent} from './component/dialog/add-quote/add-quote.component';
import {BsModalService} from "ngx-bootstrap/modal";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SearchComponent} from './component/quote-search/search.component';
import {InputDropdownComponent} from './component/input-dropdown/input-dropdown.component';
import {AutosizeModule} from "ngx-autosize";
import {RatingComponent} from './component/rating/rating.component';
import {LibraryComponent} from './component/library/library.component';
import {BookInfoComponent} from './component/dialog/add-book/book-info.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [
    AppComponent,
    MenuSidebarComponent,
    QuoteListComponent,
    AddQuoteComponent,
    SearchComponent,
    InputDropdownComponent,
    RatingComponent,
    LibraryComponent,
    BookInfoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationService
      },
      useDefaultLang: false,
    }),
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    PopoverModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.rotatingPlane,
      backdropBackgroundColour: "rgba(52, 91, 128, 0.6)",
      primaryColour: "#ffffff"
    }),
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    AutosizeModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    BsModalService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http);
}
