import {Component, Input, OnInit} from '@angular/core';
import {QuoteMainInfoVO} from "../../model/vo/project.vo";
import {QuoteService} from "../../service/quote.service";
import {forkJoin, Observable, tap} from "rxjs";
import {Dictionary} from 'typescript-collections';
import {TranslateService} from "@ngx-translate/core";
import {UserService} from "../../service/user.service";
import {ActivatedRoute} from "@angular/router";

export interface QuoteInfo {
  quote: QuoteMainInfoVO,
  isCurrentUserQuote: boolean,
  isDropdownOpen: boolean
}

@Component({
  selector: 'app-quotes-list',
  templateUrl: './quotes-list.component.html',
  styleUrls: ['./quotes-list.component.scss']
})
export class QuotesListComponent implements OnInit {

  @Input()
  public isUserQuotes: boolean;

  private readonly INITIAL_PAGE_NUMBER: number = 0;
  private readonly QUOTES_PER_PAGE_COUNT: number = 10;
  private cashedQuotesPages: Dictionary<number, QuoteInfo[]>;

  public pageQuotes: QuoteInfo[];
  public isLoading: boolean = false;

  private quotesCount: number;
  private lastPageCount: number;
  private currentPageNumber: number = this.INITIAL_PAGE_NUMBER;

  constructor(private route: ActivatedRoute,
              private translateService: TranslateService,
              private quoteService: QuoteService,
              private userLoginService: UserService) {
    this.cashedQuotesPages = new Dictionary<number, QuoteInfo[]>();
  }

  public ngOnInit(): void {
    this.isUserQuotes = this.route.snapshot.data['isUserQuotes'];
    this.isLoading = true;
    forkJoin([
      this.isUserQuotes ? this.quoteService.getUserQuotesCount(this.userLoginService.currentUserId) : this.quoteService.getAllQuotesCount(),
      this.isUserQuotes ? this.quoteService.getUserQuotesMainInfoPage(this.userLoginService.currentUserId, this.INITIAL_PAGE_NUMBER, this.QUOTES_PER_PAGE_COUNT)
        : this.quoteService.getAllQuotesMainInfoPage(this.INITIAL_PAGE_NUMBER, this.QUOTES_PER_PAGE_COUNT)
    ]).pipe(tap(() => this.isLoading = false))
      .subscribe(([quotesCount, quotesMainInfo]) => {
        this.quotesCount = quotesCount;
        this.lastPageCount = Math.trunc(quotesCount / this.QUOTES_PER_PAGE_COUNT);
        this.pageQuotes = this.getQuotesInfo(quotesMainInfo);
      });
  }

  public get isCurrentUserGuest(): boolean {
    return !this.userLoginService.isUserLoggedIn;
  }

  public toggleQuoteDropdownOpen(quoteInfo: QuoteInfo): void {
    quoteInfo.isDropdownOpen = !quoteInfo.isDropdownOpen;
  }

  public get paginationInfo(): string {
    let firstPageQuoteNumber = this.currentPageNumber;
    if (this.currentPageNumber) {
      firstPageQuoteNumber *= 10;
    }
    firstPageQuoteNumber += 1;
    let lastPageQuoteNumber = firstPageQuoteNumber + this.QUOTES_PER_PAGE_COUNT - 1;
    if (lastPageQuoteNumber > this.quotesCount) {
      lastPageQuoteNumber = this.quotesCount;
    }
    return firstPageQuoteNumber + "-" + lastPageQuoteNumber + ' (' + this.quotesCount + ' '
      + this.translateService.instant('pagination.label.quotes') + ' '
      + this.translateService.instant('pagination.label.total') + ')';
  }

  public isPageUnavailable(goAhead: boolean): boolean {
    return goAhead ? this.currentPageNumber >= this.lastPageCount : this.currentPageNumber <= this.INITIAL_PAGE_NUMBER;
  }

  public goToPage(goAhead: boolean, goToEdge: boolean): void {
    if (goToEdge) {
      this.currentPageNumber = goAhead ? this.lastPageCount : this.INITIAL_PAGE_NUMBER;
    } else {
      goAhead ? ++this.currentPageNumber : --this.currentPageNumber;
    }
    if (this.cashedQuotesPages.containsKey(this.currentPageNumber)) {
      this.pageQuotes = this.cashedQuotesPages.getValue(this.currentPageNumber);
    } else {
      this.loadPage(this.currentPageNumber);
    }
  }

  private loadPage(pageNumber: number): void {
    this.isLoading = true;
    const quoteMainInfo: Observable<QuoteMainInfoVO[]> = this.isUserQuotes
      ? this.quoteService.getUserQuotesMainInfoPage(this.userLoginService.currentUserId, this.INITIAL_PAGE_NUMBER, this.QUOTES_PER_PAGE_COUNT)
      : this.quoteService.getAllQuotesMainInfoPage(pageNumber, this.QUOTES_PER_PAGE_COUNT);
    quoteMainInfo.pipe(tap(() => this.isLoading = false)).subscribe((quotesMainInfo: QuoteMainInfoVO[]) => {
      const quotesInfo: QuoteInfo[] = this.getQuotesInfo(quotesMainInfo);
      this.pageQuotes = quotesInfo;
      this.cashedQuotesPages.setValue(pageNumber, quotesInfo);
    });
  }

  private getQuotesInfo(quotes: QuoteMainInfoVO[]): QuoteInfo[] {
    return quotes.map((quote: QuoteMainInfoVO) => ({
      quote: quote,
      isCurrentUserQuote: this.userLoginService.currentUserId === quote.userId,
      isDropdownOpen: false
    }));
  }
}
