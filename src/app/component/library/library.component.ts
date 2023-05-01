import {Component, OnInit} from '@angular/core';
import {WindowService} from "../../service/window.service";
import {Observable, tap} from "rxjs";
import {BookService} from "../../service/book.service";
import {BookVO} from "../../model/vo/project.vo";
import {UserService} from "../../service/user.service";
import {SearchMode} from "../search/search-mode";
import {BookFilterVO, QuoteFilterVO} from "../../model/vo/supplementary.vo";
import {RouteNavigationService} from "../../routing/route-navigation.service";
import {Router} from "@angular/router";
import {QuoteService} from "../../service/quote.service";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  protected readonly SearchMode = SearchMode;

  public books: BookVO[] = [];
  public isOrderedByNameAsc: boolean = false;
  public isOrderedByAuthorAsc: boolean = false;
  public isOrderedByQuotesCountAsc: boolean = false;
  public isLoading: boolean = false;

  constructor(private bookService: BookService,
              private router: Router,
              private quoteService: QuoteService,
              private userService: UserService,
              private windowService: WindowService) {
  }

  public ngOnInit(): void {
    this.loadBooksInitially();
  }

  private loadBooksInitially(): void {
    this.isLoading = true;
    const books: Observable<BookVO[]> = Boolean(this.bookService.bookFilter)
      ? this.bookService.getFilteredBooks(this.bookService.bookFilter)
      : this.bookService.getAllBooks();
    books.pipe(tap(() => this.isLoading = false))
      .subscribe((books: BookVO[]) => {
        this.books = books;
        this.orderByName(true);
      });
  }

  public addBook(): void {
    this.windowService.openAddBookDialog().subscribe(() => this.loadBooksInitially());
  }

  public editBook(book: BookVO) {
    this.windowService.openAddBookDialog(book).subscribe(() => this.loadBooksInitially());
  }

  public getBookCategories(book: BookVO): string {
    return this.bookService.getBookCategories(book);
  }

  public isCurrentUserBook(book: BookVO): boolean {
    return this.userService.currentUserId === book.userId;
  }

  public orderByName(isAsc: boolean): void {
    this.isOrderedByNameAsc = isAsc;
    this.books = this.books.sort((firstBook: BookVO, secondBook: BookVO) => {
      return isAsc ? firstBook.name.localeCompare(secondBook.name) : secondBook.name.localeCompare(firstBook.name);
    });
  }

  public orderByAuthor(isAsc: boolean): void {
    this.isOrderedByAuthorAsc = isAsc;
    this.books = this.books.sort((firstBook: BookVO, secondBook: BookVO) => {
      return isAsc ? secondBook.author.name.localeCompare(firstBook.name) : firstBook.author.name.localeCompare(secondBook.name);
    });
  }

  public orderByQuotesCount(isAsc: boolean): void {
    this.isOrderedByQuotesCountAsc = isAsc;
    this.books = this.books.sort((firstBook: BookVO, secondBook: BookVO) => {
      return isAsc ? secondBook.quotesCount - firstBook.quotesCount : firstBook.quotesCount - secondBook.quotesCount;
    });
  }

  public findBookQuotes(book: BookVO): void {
    const quoteFilter: QuoteFilterVO = new QuoteFilterVO();
    quoteFilter.bookId = book.id;
    quoteFilter.isSearch = false;
    this.quoteService.quoteFilter = quoteFilter;
    this.router.navigate([RouteNavigationService.SEARCH_QUOTES_URL]);
  }

  public onFilter(): void {
    this.loadBooksInitially();
  }

  public onFilterReset(): void {
    this.loadBooksInitially();
  }

  public showOnlyAddedByUser(showOnlyAddedByUser: boolean): void {
    let bookFilter: BookFilterVO = this.bookService.bookFilter;
    if (bookFilter) {
      if (showOnlyAddedByUser) {
        bookFilter.userId = this.userService.currentUserId;
      } else {
        bookFilter.userId = null;
      }
      this.bookService.bookFilter = bookFilter;
    } else {
      if (showOnlyAddedByUser) {
        bookFilter = new BookFilterVO();
        bookFilter.userId = this.userService.currentUserId;
        this.bookService.bookFilter = bookFilter;
      }
    }
    this.loadBooksInitially();
  }
}
