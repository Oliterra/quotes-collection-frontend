import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalService} from "ngx-bootstrap/modal";
import {forkJoin, Subject, tap} from "rxjs";
import {AuthorVO, BookVO, GroupVO, QuoteMainInfoVO, TagVO} from "../../../model/vo/project.vo";
import {GroupService} from "../../../service/group.service";
import {BookService} from "../../../service/book.service";
import {TagService} from "../../../service/tag.service";
import {FormControl} from "@angular/forms";
import {UserService} from "../../../service/user.service";
import {QuoteService} from "../../../service/quote.service";
import {WindowService} from "../../../service/window.service";

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

  public readonly HASH_SYMBOL: string = '#';

  @Input()
  public closeEmitter: Subject<void>;

  public books: BookVO[] = [];
  public groups: GroupInfo[] = [];
  public tags: TagInfo[] = [];
  public selectedBook: BookVO;
  public filteredBooks: BookVO[] = [];
  public filteredTags: TagInfo[] = [];
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
              private userService: UserService,
              private windowService: WindowService) {
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

  public onBookAdding(): void {
    this.windowService.openAddBookDialog(null, this.bookFormControl.value).subscribe((book: BookVO) => {
      if (book) {
        this.books.push(book);
        this.selectedBook = book;
        this.bookFormControl.setValue(book.name);
      }
    });
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
    quote.book = this.selectedBook;
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
