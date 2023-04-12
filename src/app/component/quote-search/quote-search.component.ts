import {Component, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {forkJoin, Subject} from "rxjs";
import {QuoteFilterVO} from "../../model/vo/supplementary.vo";
import {AuthorVO, BookVO, CategoryVO, TagVO} from "../../model/vo/project.vo";
import {BookService} from "../../service/book.service";
import {AuthorService} from "../../service/author.service";
import {CategoryService} from "../../service/category.service";
import {TagService} from "../../service/tag.service";

@Component({
  selector: 'app-quote-search',
  templateUrl: './quote-search.component.html',
  styleUrls: ['./quote-search.component.scss']
})
export class QuoteSearchComponent implements OnInit {

  @Input()
  public isUserQuotes: boolean;
  @Input()
  public isAdvancedSearch: boolean = false;

  @Output()
  public onFilter: Subject<QuoteFilterVO> = new Subject<QuoteFilterVO>();
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
              private tagService: TagService) {
  }

  ngOnInit(): void {
    forkJoin([this.authorService.getAllAuthors(), this.bookService.getAllBooks(),
      this.categoryService.getAllCategories(), this.tagService.getAllTags()
    ]).subscribe(([authors, books, categories, tag]) => {
      this.authors = authors;
      this.books = books;
      this.categories = categories;
      this.tags = tag;
    });
    this.searchFormGroup = new FormGroup({
      book: new FormControl(''),
      author: new FormControl(''),
      category: new FormControl(''),
      text: new FormControl(''),
      tags: new FormControl(''),
    });
  }

  public get canBeFiltered(): boolean {
    return Boolean(this.authorId) || Boolean(this.bookId) || Boolean(this.categoryIds.length)
      || Boolean(this.searchFormGroup.get('text').value) || Boolean(this.tagIds.length);
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
    const quoteFilter: QuoteFilterVO = {
      authorId: this.authorId,
      bookId: this.bookId,
      categoryIds: this.categoryIds,
      text: this.searchFormGroup.get('text').value,
      tagIds: this.tagIds
    };
    this.onFilter.next(quoteFilter);
    this.searchFormGroup.reset();
    this.canReset = true;
  }

  public reset(): void {
    this.onFilterReset.next();
    this.canReset = false;
  }
}
