import {Component, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {forkJoin, Subject} from "rxjs";
import {QuoteFilterVO} from "../../model/vo/supplementary.vo";
import {AuthorVO, BookVO, CategoryVO, TagVO} from "../../model/vo/project.vo";
import {BookService} from "../../service/book.service";
import {AuthorService} from "../../service/author.service";
import {CategoryService} from "../../service/category.service";
import {TagService} from "../../service/tag.service";
import {QuoteService} from "../../service/quote.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Input()
  public isAdvancedSearch: boolean = false;
  @Input()
  public externalFilter: Subject<void> = new Subject<void>();

  @Output()
  public onFilter: Subject<void> = new Subject<void>();
  @Output()
  public onFilterReset: Subject<void> = new Subject<void>();

  public authors: AuthorVO[];
  public books: BookVO[];
  public categories: CategoryVO[];
  public tags: TagVO[];

  public bookId: number;
  public authorId: number;
  public categoryIds: number[] = [];
  public text: string;
  public tagIds: number[] = [];

  public searchFormGroup: FormGroup;
  public canReset: boolean = true;

  constructor(private authorService: AuthorService,
              private bookService: BookService,
              private categoryService: CategoryService,
              private tagService: TagService,
              private quoteService: QuoteService) {
  }

  public ngOnInit(): void {
    forkJoin([this.authorService.getAllAuthors(), this.bookService.getAllBooks(),
      this.categoryService.getAllCategories()
    ]).subscribe(([authors, books, categories]) => {
      this.authors = authors;
      this.books = books;
      this.categories = categories;
    });
    if (this.isAdvancedSearch) {
      this.tagService.getAllTags().subscribe((tags: TagVO[]) => this.tags = tags);
      this.externalFilter.subscribe(() => this.onExternalFilter());
    }
    this.searchFormGroup = new FormGroup({
      book: new FormControl(''),
      author: new FormControl(''),
      category: new FormControl(''),
      text: new FormControl(''),
      tags: new FormControl(''),
    });
  }

  public get canBeFiltered(): boolean {
    const mainFieldsFilled: boolean = Boolean(this.authorId) || Boolean(this.bookId) || Boolean(this.categoryIds.length);
    return !this.isAdvancedSearch
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

  public find(): void {
    if (this.isAdvancedSearch) {
      this.quoteService.quoteFilter = {
        authorId: this.authorId,
        bookId: this.bookId,
        categoryIds: this.categoryIds,
        text: this.searchFormGroup.get('text').value,
        tagIds: this.tagIds
      };
    } else {
      this.bookService.bookFilter = {
        authorId: this.authorId,
        bookId: this.bookId,
        categoryIds: this.categoryIds
      };
    }
    this.onFilter.next();
    this.canReset = true;
  }

  public onExternalFilter(): void {
    if (this.isAdvancedSearch) {
      this.searchFormGroup.reset();
      const externalQuoteFilter: QuoteFilterVO = this.quoteService.quoteFilter;
      if (externalQuoteFilter) {
        if (externalQuoteFilter.authorId) {
          this.searchFormGroup.get('author').setValue(this.authors.find((author: AuthorVO) => author.id === externalQuoteFilter.authorId).name);
        }
        if (externalQuoteFilter.bookId) {
          this.searchFormGroup.get('book').setValue(this.books.find((book: BookVO) => book.id === externalQuoteFilter.bookId).name);
        }
        if (externalQuoteFilter.tagIds) {
          this.searchFormGroup.get('tags').setValue(this.tags.find((tag: TagVO) => tag.id === externalQuoteFilter.tagIds[0]).name);
        }
        this.canReset = true;
      }
    }
  }

  public reset(): void {
    if (this.isAdvancedSearch) {
      this.quoteService.resetQuoteFilter();
    } else {
      this.bookService.resetBookFilter();
    }
    this.onFilterReset.next();
    this.searchFormGroup.reset();
    this.canReset = false;
  }
}
