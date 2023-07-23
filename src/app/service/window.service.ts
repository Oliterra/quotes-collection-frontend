import {Injectable} from '@angular/core';
import {BsModalService} from "ngx-bootstrap/modal";
import {AddQuoteComponent} from "../component/dialog/add-quote/add-quote.component";
import {Subject} from "rxjs";
import {BookInfoComponent} from "../component/dialog/add-book/book-info.component";
import {AuthorVO, BookVO} from "../model/vo/project.vo";
import {AddAuthorComponent} from "../component/dialog/add-author/add-author.component";

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  private keyboard = true;
  private ignoreBackdropClick = true;

  constructor(private bsModalService: BsModalService) {
  }

  public openAddQuoteDialog(): Subject<void> {
    const closeEmitter: Subject<void> = new Subject<void>();
    this.bsModalService.show(AddQuoteComponent, {
      class: 'modal-lg modal-width-lg',
      keyboard: this.keyboard,
      ignoreBackdropClick: this.ignoreBackdropClick,
      initialState: {
        closeEmitter
      }
    });
    return closeEmitter;
  }

  public openAddBookDialog(book: BookVO = null, bookName: string = null): Subject<BookVO> {
    const closeEmitter: Subject<BookVO> = new Subject<BookVO>();
    this.bsModalService.show(BookInfoComponent, {
      class: 'modal-lg modal-width-lg',
      keyboard: this.keyboard,
      ignoreBackdropClick: this.ignoreBackdropClick,
      initialState: {
        book,
        bookName,
        closeEmitter
      }
    });
    return closeEmitter;
  }

  public openAddAuthorDialog(): Subject<AuthorVO> {
    const closeEmitter: Subject<AuthorVO> = new Subject<AuthorVO>();
    this.bsModalService.show(AddAuthorComponent, {
      class: 'modal-lg modal-width-lg',
      keyboard: this.keyboard,
      ignoreBackdropClick: this.ignoreBackdropClick,
      initialState: {
        closeEmitter
      }
    });
    return closeEmitter;
  }
}
