import {Component, Input, OnInit} from '@angular/core';
import {QuoteMainInfoVO, UserQuoteRatingVO} from "../../model/vo/project.vo";
import {QuoteService} from "../../service/quote.service";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  private readonly _MARKS: number[] = [1, 2, 3, 4, 5];

  @Input()
  public quote: QuoteMainInfoVO;

  public showOptions: boolean;
  public puttedMark: number;

  constructor(private quoteService: QuoteService,
              private userService: UserService) {
  }

  public ngOnInit(): void {
    this.userService.getRatingByUserId(this.userService.currentUserId, this.quote.id).subscribe((userRating: number) => {
      if (userRating) {
        this.puttedMark = userRating;
      }
    });
  }

  public get rating(): string {
    return this.quote.rating ? String(this.quote.rating) : '-';
  }

  public get marks(): number[] {
    return this._MARKS;
  }

  public isMarkSelected(mark: number): boolean {
    return this.puttedMark === mark;
  }

  public putRating(mark: number): void {
    this.puttedMark = mark;
    const userQuoteRating: UserQuoteRatingVO = new UserQuoteRatingVO();
    userQuoteRating.quoteId = this.quote.id;
    userQuoteRating.userId = this.userService.currentUserId;
    userQuoteRating.rating = mark;
    this.quoteService.putUserRating(userQuoteRating).subscribe((updatedRating: number) => this.quote.rating = updatedRating);
  }

  public openOptions(): void {
    this.showOptions = true;
  }

  public close(): void {
    this.showOptions = false;
  }
}
