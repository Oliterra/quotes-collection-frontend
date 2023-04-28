import {Component, OnInit} from '@angular/core';
import {WindowService} from "../../service/window.service";
import {Observable, tap} from "rxjs";
import {BookService} from "../../service/book.service";
import {BookVO} from "../../model/vo/project.vo";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  public books: BookVO[] = [];
  public isOrderedByNameAsc: boolean = false;
  public isOrderedByAuthorAsc: boolean = false;
  public isOrderedByQuotesCountAsc: boolean = false;
  public isLoading: boolean = false;

  private isFiltered: boolean = false;

  constructor(private bookService: BookService,
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
      });
    this.orderByName(true);
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
      return isAsc ? secondBook.name.localeCompare(firstBook.name) : firstBook.name.localeCompare(secondBook.name);
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

  public onFilter(): void {
    this.loadBooksInitially();
  }

  public onFilterReset(): void {
    this.loadBooksInitially();
  }
}
