import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {GroupVO, QuoteMainInfoVO, TagVO} from "../../model/vo/project.vo";
import {QuoteService} from "../../service/quote.service";
import {Observable, Subject, tap} from "rxjs";
import {Dictionary} from 'typescript-collections';
import {TranslateService} from "@ngx-translate/core";
import {UserService} from "../../service/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {WindowService} from "../../service/window.service";
import {QuoteFilterVO, QuoteListVO} from "../../model/vo/supplementary.vo";
import {RouteNavigationService} from "../../routing/route-navigation.service";

export interface QuoteInfo {
  quote: QuoteMainInfoVO,
  isCurrentUserQuote: boolean,
  isDropdownOpen: boolean
}

@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.scss']
})
export class QuoteListComponent implements OnInit {

  private readonly INITIAL_PAGE_NUMBER: number = 0;
  private readonly QUOTES_PER_PAGE_COUNT: number = 10;

  @Input()
  public isUserQuotes: boolean;

  public pageQuotes: QuoteInfo[];
  public isLoading: boolean = false;
  public filter: Subject<void> = new Subject<void>();

  private quotesCount: number;
  private lastPageCount: number;
  private currentPageNumber: number = this.INITIAL_PAGE_NUMBER;
  private isFiltered: boolean = false;
  private cashedQuotesPages: Dictionary<number, QuoteInfo[]>;
  private cashedFilteredQuotesPages: Dictionary<number, QuoteInfo[]>;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private translateService: TranslateService,
              private quoteService: QuoteService,
              private userLoginService: UserService,
              private windowService: WindowService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.cashedQuotesPages = new Dictionary<number, QuoteInfo[]>();
    this.cashedFilteredQuotesPages = new Dictionary<number, QuoteInfo[]>();
  }

  public ngOnInit(): void {
    this.isUserQuotes = this.activatedRoute.snapshot.data['isUserQuotes'];
    this.loadQuotesInitially();
  }

  private loadQuotesInitially(): void {
    this.isLoading = true;
    this.isFiltered = Boolean(this.quoteService.quoteFilter);
    let quoteListObservable: Observable<QuoteListVO>;
    if (this.isFiltered) {
      quoteListObservable = this.quoteService.getFilteredQuotes(this.quoteService.quoteFilter);
    } else {
      quoteListObservable = this.isUserQuotes
        ? this.quoteService.getUserQuotesMainInfoPage(this.userLoginService.currentUserId, this.INITIAL_PAGE_NUMBER, this.QUOTES_PER_PAGE_COUNT)
        : this.quoteService.getAllQuotesMainInfoPage(this.INITIAL_PAGE_NUMBER, this.QUOTES_PER_PAGE_COUNT);
    }
    quoteListObservable.pipe(tap(() => this.isLoading = false))
      .subscribe((quoteList: QuoteListVO) => {
        this.quotesCount = quoteList.count;
        this.lastPageCount = Math.trunc(this.quotesCount / this.QUOTES_PER_PAGE_COUNT);
        if (this.isFiltered) {
          this.clearCash();
          this.cashFilteredQuotes(quoteList);
          this.pageQuotes = this.cashedFilteredQuotesPages.getValue(this.INITIAL_PAGE_NUMBER);
          this.filter.next();
        } else {
          this.pageQuotes = this.getQuotesInfo(quoteList.quotes);
        }
      });
  }

  public get isCurrentUserGuest(): boolean {
    return !this.userLoginService.isUserLoggedIn;
  }

  public addQuote(): void {
    this.windowService.openAddQuoteDialog().subscribe(() => {
      this.clearCash();
      this.isFiltered = false;
      this.loadQuotesInitially();
    });
  }

  public getGroupNames(quoteMainInfo: QuoteMainInfoVO): string[] {
    return quoteMainInfo.groups.map((group: GroupVO) => group.name);
  }

  public toggleQuoteDropdownOpen(quoteInfo: QuoteInfo): void {
    quoteInfo.isDropdownOpen = !quoteInfo.isDropdownOpen;
  }

  public get paginationInfo(): string {
    let firstPageQuoteNumber = this.currentPageNumber;
    if (this.currentPageNumber) {
      firstPageQuoteNumber *= 10;
    }
    if (this.quotesCount > 1) {
      firstPageQuoteNumber += 1;
    }
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

  private cashFilteredQuotes(quoteList: QuoteListVO): void {
    const filteredQuotes: QuoteInfo[] = this.getQuotesInfo(quoteList.quotes);
    let filteredPageNumber: number = this.INITIAL_PAGE_NUMBER;
    let firstPageQuoteIndex: number = this.INITIAL_PAGE_NUMBER;
    while (firstPageQuoteIndex < quoteList.count) {
      let lastPageQuoteIndex: number = firstPageQuoteIndex + this.QUOTES_PER_PAGE_COUNT;
      if (lastPageQuoteIndex > quoteList.count) {
        lastPageQuoteIndex = quoteList.count;
      }
      this.cashedFilteredQuotesPages.setValue(filteredPageNumber, filteredQuotes.slice(firstPageQuoteIndex, lastPageQuoteIndex));
      filteredPageNumber++;
      firstPageQuoteIndex = firstPageQuoteIndex + this.QUOTES_PER_PAGE_COUNT;
    }
  }

  public goToPage(goAhead: boolean, goToEdge: boolean): void {
    if (goToEdge) {
      this.currentPageNumber = goAhead ? this.lastPageCount : this.INITIAL_PAGE_NUMBER;
    } else {
      goAhead ? ++this.currentPageNumber : --this.currentPageNumber;
    }
    if (this.isFiltered) {
      this.pageQuotes = this.cashedFilteredQuotesPages.getValue(this.currentPageNumber);
    } else {
      if (this.cashedQuotesPages.containsKey(this.currentPageNumber)) {
        this.pageQuotes = this.cashedQuotesPages.getValue(this.currentPageNumber);
      } else {
        this.loadPage(this.currentPageNumber);
      }
    }
  }

  private loadPage(pageNumber: number): void {
    this.isLoading = true;
    const quoteListObservable: Observable<QuoteListVO> = this.isUserQuotes
      ? this.quoteService.getUserQuotesMainInfoPage(this.userLoginService.currentUserId, pageNumber, this.QUOTES_PER_PAGE_COUNT)
      : this.quoteService.getAllQuotesMainInfoPage(pageNumber, this.QUOTES_PER_PAGE_COUNT);
    quoteListObservable.pipe(tap(() => this.isLoading = false)).subscribe((quoteList: QuoteListVO) => {
      const quotesInfo: QuoteInfo[] = this.getQuotesInfo(quoteList.quotes);
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

  public onAuthorClick(quoteMainInfo: QuoteMainInfoVO) {
    const authorFilter: QuoteFilterVO = new QuoteFilterVO();
    authorFilter.authorId = quoteMainInfo.book.author.id;
    this.filterByCriteria(authorFilter);
  }

  public onVisibilityClick(quoteInfo: QuoteInfo) {
    this.quoteService.changeQuoteVisibility(quoteInfo.quote.id).subscribe((updatedQuote: QuoteMainInfoVO) => quoteInfo.quote = updatedQuote);
  }

  public onBookClick(quoteMainInfo: QuoteMainInfoVO) {
    const bookFilter: QuoteFilterVO = new QuoteFilterVO();
    bookFilter.bookId = quoteMainInfo.book.id;
    this.filterByCriteria(bookFilter);
  }

  public onTagClick(tag: TagVO) {
    const tagFilter: QuoteFilterVO = new QuoteFilterVO();
    tagFilter.tagIds = [tag.id];
    this.filterByCriteria(tagFilter);
  }

  public filterByCriteria(quoteFilter: QuoteFilterVO): void {
    this.quoteService.quoteFilter = quoteFilter;
    if (this.isUserQuotes) {
      this.router.navigate([RouteNavigationService.SEARCH_QUOTES_URL]);
    } else {
      this.loadQuotesInitially();
    }
  }

  private clearCash(): void {
    this.cashedQuotesPages.clear();
    this.cashedFilteredQuotesPages.clear();
  }

  public onFilter(): void {
    this.isFiltered = true;
    this.clearCash();
    this.loadQuotesInitially();
  }

  public onFilterReset(): void {
    this.isFiltered = false;
    this.clearCash();
    this.loadQuotesInitially();
  }
}
