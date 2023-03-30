import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalService} from "ngx-bootstrap/modal";
import {forkJoin, Subject, tap} from "rxjs";
import {BookVO, GroupVO, QuoteMainInfoVO, TagVO} from "../../../model/vo/project.vo";
import {GroupService} from "../../../service/group.service";
import {BookService} from "../../../service/book.service";
import {TagService} from "../../../service/tag.service";
import {FormControl} from "@angular/forms";
import {UserService} from "../../../service/user.service";
import {QuoteService} from "../../../service/quote.service";

export interface GroupInfo {
  group: GroupVO,
  isSelected: boolean
}

export interface TagInfo {
  tag: TagVO,
  isSelected: boolean
}

@Component({
  selector: 'app-add-quote',
  templateUrl: './add-quote.component.html',
  styleUrls: ['./add-quote.component.scss']
})
export class AddQuoteComponent implements OnInit {

  public readonly LI_HEIGHT: number = 25;
  public readonly HASH_SYMBOL: string = '#';

  @ViewChild('quoteTextarea') quoteTextarea: ElementRef;

  @Input()
  public closeEmitter: Subject<void>;

  public books: BookVO[] = [];
  public groups: GroupInfo[] = [];
  public tags: TagInfo[] = [];
  public selectedBook: BookVO;
  public filteredBooks: BookVO[] = [];
  public filteredTags: TagInfo[] = [];
  public isBookDropdownOpen: boolean = false;
  public isPublic: boolean = false;
  public isLoading: boolean = false;
  public bookFormControl: FormControl = new FormControl<string>('');
  public textFormControl: FormControl = new FormControl<string>('');
  public tagFormControl: FormControl = new FormControl<string>('');

  constructor(private bookService: BookService,
              private bsModalService: BsModalService,
              private cdRef: ChangeDetectorRef,
              private groupService: GroupService,
              private quoteService: QuoteService,
              private tagService: TagService,
              private userService: UserService) {
  }

  public ngOnInit(): void {
    this.isLoading = true;
    forkJoin([
      this.bookService.getAllBooks(),
      this.groupService.getUserGroups(this.userService.currentUserId),
      this.tagService.getAllTags()
    ]).pipe(tap(() => this.isLoading = false))
      .subscribe(([books, groups, tags]) => {
        this.books = books;
        this.filteredBooks = books;
        groups.forEach((group: GroupVO) => {
          this.groups.push({
            group: group,
            isSelected: false
          });
        });
        tags.forEach((tag: TagVO) => {
          this.tags.push({
            tag: tag,
            isSelected: false
          });
        });
        this.filteredTags = this.tags;
      });
  }

  public onBookInputChange(event) {
    const typedString: string = event.target.value.toLowerCase();
    this.isBookDropdownOpen = true;
    if (typedString.length) {
      this.filteredBooks = this.books.filter((book: BookVO) => book.name.startsWith(typedString) || book.name.toLowerCase().startsWith(typedString));
    } else {
      this.filteredBooks = [];
    }
  }

  public getBookInfo(book: BookVO): string {
    if (book) {
      return `${book.name} - ${book.author.name} ${book.author.surname}`;
    } else {
      return '';
    }
  }

  public getBooksHintHeight(isSingleElement: boolean): string {
    if (isSingleElement || !this.filteredBooks.length) {
      return this.LI_HEIGHT + 'px';
    } else {
      let count: number = 4;
      if (this.filteredBooks.length < 3) {
        count = this.filteredBooks.length + 1;
      }
      return this.LI_HEIGHT * count + 'px';
    }
  }

  public selectBook(book: BookVO): void {
    this.selectedBook = book;
    this.bookFormControl.setValue(this.selectedBook.name);
    this.isBookDropdownOpen = false;
  }

  public onQuoteTextareaInput(): void {
    const nativeElement = this.quoteTextarea.nativeElement as HTMLTextAreaElement;
    nativeElement.style.overflow = 'hidden';
    nativeElement.style.height = 'auto';
    nativeElement.style.height = `${nativeElement.scrollHeight}px`;
  }

  public toggleVisibility(isPublic: boolean): void {
    this.isPublic = isPublic;
  }

  public toggleGroupSelection(groupInfo: GroupInfo): void {
    groupInfo.isSelected = !groupInfo.isSelected;
  }

  public toggleTagSelection(tagInfo: TagInfo): void {
    tagInfo.isSelected = !tagInfo.isSelected;
  }

  public onTagsInputChange(event) {
    this.filterTags(event.target.value.toLowerCase());
  }

  public isTagExist(typedString: string): boolean {
    return Boolean(this.tags.find((tagInfo: TagInfo) => tagInfo.tag.name.substring(1) === typedString));
  }

  public addTag(): void {
    const typedTag: string = this.tagFormControl.value;
    if (typedTag?.length >= 2 && !this.isTagExist(typedTag)) {
      const newTag: TagVO = new TagVO();
      newTag.name = this.HASH_SYMBOL + typedTag;
      this.tags.unshift({
        tag: newTag,
        isSelected: true
      });
      this.tagFormControl.reset();
      this.filterTags(null);
    }
  }

  private filterTags(typedString: string) {
    this.filteredTags = this.tags;
    if (typedString) {
      this.filteredTags = this.filteredTags.filter((tagInfo: TagInfo) => tagInfo.tag.name.substring(1).startsWith(typedString));
    }
  }

  public canBeAdded(): boolean {
    return this.selectedBook && this.textFormControl.value;
  }

  public add(): void {
    const quote: QuoteMainInfoVO = new QuoteMainInfoVO();
    quote.userId = this.userService.currentUserId;
    quote.bookId = this.selectedBook.id;
    quote.text = String(this.textFormControl.value).trim();
    quote.isPublic = this.isPublic;
    quote.groups = this.groups.filter((groupInfo: GroupInfo) => groupInfo.isSelected).map((groupInfo: GroupInfo) => groupInfo.group);
    quote.tags = this.tags.filter((tagInfo: TagInfo) => tagInfo.isSelected).map((tagInfo: TagInfo) => tagInfo.tag);
    this.quoteService.createQuote(quote).subscribe(() => this.close());
  }

  public close(): void {
    this.bsModalService.hide();
    this.closeEmitter.next();
  }
}
