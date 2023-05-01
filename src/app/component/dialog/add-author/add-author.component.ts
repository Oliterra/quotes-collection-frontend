import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {Subject} from "rxjs";
import {AuthorVO} from "../../../model/vo/project.vo";
import {AuthorService} from "../../../service/author.service";

@Component({
  selector: 'app-add-author',
  templateUrl: './add-author.component.html'
})
export class AddAuthorComponent {

  @Input()
  public closeEmitter: Subject<AuthorVO>;

  public nameFormControl: FormControl = new FormControl<any>('');
  public surnameFormControl: FormControl = new FormControl<any>('');

  constructor(private authorService: AuthorService,
              private bsModalRef: BsModalRef) {
  }

  public canBeConfirmed(): boolean {
    return this.nameFormControl.value && this.surnameFormControl.value;
  }

  public confirm(): void {
    const author: AuthorVO = new AuthorVO();
    author.name = this.nameFormControl.value + ' ' + this.surnameFormControl.value;
    this.authorService.createAuthor(author).subscribe((author: AuthorVO) => this.close(author));
  }

  public close(author?: AuthorVO): void {
    this.closeEmitter.next(author);
    this.bsModalRef.hide();
  }
}
