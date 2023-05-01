import {Component, Input, OnInit} from '@angular/core';
import {forkJoin, Subject} from "rxjs";
import {BsModalRef} from "ngx-bootstrap/modal";
import {FormControl} from "@angular/forms";
import {AuthorVO, BookVO, CategoryVO} from "../../../model/vo/project.vo";
import {BookService} from "../../../service/book.service";
import {AuthorService} from "../../../service/author.service";
import {CategoryService} from "../../../service/category.service";
import {UserService} from "../../../service/user.service";
import {WindowService} from "../../../service/window.service";

@Component({
  selector: 'app-book-info',
  templateUrl: './book-info.component.html'
})
export class BookInfoComponent implements OnInit {

  @Input()
  public book: BookVO;
  @Input()
  public closeEmitter: Subject<BookVO>;

  public authors: AuthorVO[];
  public categories: CategoryVO[];
  public authorId: number;
  public categoryIds: number[];
  public bookInfoFormControl: FormControl;
  public authorInfoFormControl: FormControl;
  public categoriesInfoFormControl: FormControl;
  public isBookChanged: boolean = false;
  public isLoading: boolean = false;

  constructor(private authorService: AuthorService,
              private bsModalRef: BsModalRef,
              private bookService: BookService,
              private categoryService: CategoryService,
              private userService: UserService,
              private windowService: WindowService) {
  }

  public ngOnInit(): void {
    forkJoin([this.authorService.getAllAuthors(), this.categoryService.getAllCategories()
    ]).subscribe(([authors, categories]) => {
      this.authors = authors;
      this.categories = categories;
    });
    this.bookInfoFormControl = new FormControl<any>(this.book?.name || '');
    this.authorInfoFormControl = new FormControl<any>(this.book?.author?.name || '');
    this.authorId = this.book ? this.book.author.id : null;
    this.categoriesInfoFormControl = new FormControl<any>(this.book ? this.bookService.getBookCategories(this.book) : '');
    this.categoryIds = this.book ? this.book.categories.map((category: CategoryVO) => category.id) : [];
  }

  public onAuthorSelection(selectedAuthor: AuthorVO): void {
    if (this.authorId !== selectedAuthor.id) {
      this.isBookChanged = true;
    }
    this.authorId = selectedAuthor.id
  }

  public onAuthorUnselection(unselectedAuthor: AuthorVO): void {
    this.isBookChanged = true;
    this.authorId = null;
  }

  public onCategorySelection(selectedCategory: CategoryVO): void {
    this.isBookChanged = true;
    this.categoryIds.push(selectedCategory.id);
  }

  public onCategoryUnselection(unselectedCategory: CategoryVO): void {
    this.isBookChanged = true;
    this.categoryIds = this.categoryIds.filter((id: number) => id !== unselectedCategory.id);
  }

  public onAuthorAdding(): void {
    this.windowService.openAddAuthorDialog().subscribe((author: AuthorVO) => {
      if (author) {
        this.authors.push(author);
        this.authorId = author.id;
        this.authorInfoFormControl.setValue(author.name);
      }
    });
  }

  public canBeConfirmed() {
    const isMainInfo: boolean = this.bookInfoFormControl.value && Boolean(this.authorId);
    if (this.book) {
      return isMainInfo && this.isBookChanged;
    } else {
      return isMainInfo;
    }
  }

  public confirm(): void {
    const book: BookVO = new BookVO();
    book.name = this.bookInfoFormControl.value;
    const author: AuthorVO = new AuthorVO();
    author.id = this.authorId;
    book.author = author;
    const categories: CategoryVO[] = [];
    this.categoryIds.forEach((categoryId: number) => {
      const category: CategoryVO = new CategoryVO();
      category.id = categoryId;
      categories.push(category);
    });
    book.categories = categories;
    if (this.book) {
      book.id = this.book.id;
      this.bookService.editBook(book).subscribe((book: BookVO) => {
        this.book = book;
        this.close();
      });
    } else {
      book.userId = this.userService.currentUserId;
      this.bookService.createBook(book).subscribe((book: BookVO) => {
        this.book = book;
        this.close();
      });
    }
  }

  public close(): void {
    this.bsModalRef.hide();
    this.closeEmitter.next(this.book);
  }
}
