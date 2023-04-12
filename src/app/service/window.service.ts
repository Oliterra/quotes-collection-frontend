import {Injectable} from '@angular/core';
import {BsModalService} from "ngx-bootstrap/modal";
import {AddQuoteComponent} from "../component/dialog/add-quote/add-quote.component";
import {Subject} from "rxjs";

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
}
