import {ChangeDetectorRef, Component, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {forkJoin, of, Subject, tap} from "rxjs";
import {QuoteFilterVO} from "../../model/vo/supplementary.vo";
import {AuthorVO, BookVO, CategoryVO, TagVO} from "../../model/vo/project.vo";
import {BookService} from "../../service/book.service";
import {AuthorService} from "../../service/author.service";
import {CategoryService} from "../../service/category.service";
import {TagService} from "../../service/tag.service";
import {QuoteService} from "../../service/quote.service";
import {SearchMode} from "./search-mode";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  protected readonly SearchMode = SearchMode;

  @Input()
  public mode: SearchMode;
  @Input()
  public externalFilter: Subject<void> = new Subject<void>();

  @Output()
  public onFilter: Subject<void> = new Subject<void>();
  @Output()
  public onFilterReset: Subject<void> = new Subject<void>();
  @Output()
  public onShowOnlyAddedByUser: Subject<boolean> = new Subject<boolean>();

  public authors: AuthorVO[] = [];
  public books: BookVO[] = [];
  public categories: CategoryVO[] = [];
  public tags: TagVO[] = [];

  public bookId: number;
  public authorId: number;
  public categoryIds: number[] = [];
  public text: string;
  public tagIds: number[] = [];

  public searchFormGroup: FormGroup;

  public canReset: boolean = false;
  public showOnlyAddedByUser: boolean = false;
  public isLoading: boolean = false;
  private isDataLoaded: boolean = false;
  private isExternalFiltered: boolean = false;

  constructor(private authorService: AuthorService,
              private bookService: BookService,
              private categoryService: CategoryService,
              private cdRef: ChangeDetectorRef,
              private tagService: TagService,
              private userService: UserService,
              private quoteService: QuoteService) {
  }

  public ngOnInit(): void {
    this.loadData();
    this.externalFilter.subscribe(() => this.onExternalFilter());
    this.searchFormGroup = new FormGroup({
      book: new FormControl(''),
      author: new FormControl(''),
      category: new FormControl(''),
      text: new FormControl(''),
      tags: new FormControl(''),
    });
  }

  public get isQuoteSearchMode(): boolean {
    return this.mode === SearchMode.quoteMode;
  }

  public get isBookSearchMode(): boolean {
    return this.mode === SearchMode.bookMode;
  }

  private loadData(): void {
    forkJoin([this.authorService.getAllAuthors(), this.bookService.getAllBooks(),
      this.categoryService.getAllCategories(), this.isQuoteSearchMode ? this.tagService.getAllTags() : of([])
    ]).pipe(tap(() => this.isLoading = false))
      .subscribe(([authors, books, categories, tags]) => {
        this.authors = authors;
        this.books = books;
        this.categories = categories;
        this.tags = tags;
        this.isDataLoaded = true;
        if (this.isExternalFiltered) {
          this.externalFilter.next();
        }
      });
  }

  public get canBeFiltered(): boolean {
    const mainFieldsFilled: boolean = Boolean(this.authorId) || Boolean(this.bookId) || Boolean(this.categoryIds.length);
    return this.isBookSearchMode
      ? mainFieldsFilled
      : mainFieldsFilled || Boolean(this.searchFormGroup.get('text').value) || Boolean(this.tagIds.length);
  }

  public onCategorySelection(selectedCategory: CategoryVO): void {
    this.categoryIds.push(selectedCategory.id);
  }

  public onCategoryUnselection(unselectedCategory: CategoryVO): void {
    this.categoryIds = this.categoryIds.filter((id: number) => id !== unselectedCategory.id);
  }

  public onTagSelection(selectedTag: TagVO): void {
    this.tagIds.push(selectedTag.id);
  }

  public onTagUnselection(unselectedTag: TagVO): void {
    this.tagIds = this.tagIds.filter((id: number) => id !== unselectedTag.id);
  }

  public onShowOnlyAddedByUserChange(): void {
    this.showOnlyAddedByUser = !this.showOnlyAddedByUser;
    this.onShowOnlyAddedByUser.next(this.showOnlyAddedByUser);
  }

  public find(): void {
    if (this.isQuoteSearchMode) {
      this.quoteService.quoteFilter = {
        authorId: this.authorId,
        bookId: this.bookId,
        categoryIds: this.categoryIds,
        text: this.searchFormGroup.get('text').value,
        tagIds: this.tagIds,
        isSearch: true
      };
    }
    if (this.isBookSearchMode) {
      this.bookService.bookFilter = {
        authorId: this.authorId,
        bookId: this.bookId,
        userId: this.showOnlyAddedByUser ? this.userService.currentUserId : null,
        categoryIds: this.categoryIds
      };
    }
    this.onFilter.next();
    this.canReset = true;
  }

  public onExternalFilter(): void {
    if (this.isQuoteSearchMode) {
      if (this.isDataLoaded) {
        this.searchFormGroup.reset();
        const externalQuoteFilter: QuoteFilterVO = this.quoteService.quoteFilter;
        if (externalQuoteFilter) {
          if (externalQuoteFilter.authorId) {
            this.searchFormGroup.get('author').setValue(this.authors.find((author: AuthorVO) => author.id === externalQuoteFilter.authorId).name);
          }
          if (externalQuoteFilter.bookId) {
            this.searchFormGroup.get('book').setValue(this.books.find((book: BookVO) => book.id === externalQuoteFilter.bookId).name);
          }
          if (externalQuoteFilter.tagIds.length) {
            this.searchFormGroup.get('tags').setValue(this.tags.find((tag: TagVO) => tag.id === externalQuoteFilter.tagIds[0]).name);
          }
          this.canReset = true;
          this.isExternalFiltered = false;
        }
      } else {
        this.isExternalFiltered = true;
      }
    }
  }

  public reset(): void {
    this.resetLocalData();
    if (this.isQuoteSearchMode) {
      this.quoteService.resetQuoteFilter();
    }
    if (this.isBookSearchMode) {
      if (this.showOnlyAddedByUser) {
        this.bookService.bookFilter.authorId = null;
        this.bookService.bookFilter.bookId = null;
        this.bookService.bookFilter.categoryIds = null;
      } else {
        this.bookService.resetBookFilter();
      }
    }
    this.onFilterReset.next();
    this.searchFormGroup.reset();
    this.canReset = false;
  }

  private resetLocalData(): void {
    this.bookId = null;
    this.authorId = null;
    this.categoryIds = [];
    this.text = null;
    this.tagIds = [];
  }
}
