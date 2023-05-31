import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthorizationInfoVO, RegistrationInfoVO} from "../../model/vo/supplementary.vo";
import {LoginService} from "../../service/login.service";
import {ErrorTranslatorService} from "../../model/error-translator.service";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {RouteNavigationService} from "../../routing/route-navigation.service";
import {catchError, Observable, ObservableInput, of, tap} from "rxjs";

enum LoginMode {
  signIn,
  signUp
}

interface InfoItem {
  title: string,
  points?: InfoItem[],
  isFocused?: boolean,
  showNumeration?: boolean,
  imageSrc?: string
}

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartPageComponent implements OnInit {

  private readonly TRANSLATIONS_SOURCE: string = '/assets/i18n/';
  private readonly HEADER_PREFIX: string = '/assets/images/header_';
  private readonly HEADER_EXTENSION: string = '.svg';
  private readonly LETTERS_PATTERN: string = '[a-zA-Zа-яА-Я]+$';

  public loginMode: LoginMode;
  public formGroup: FormGroup;
  public featureInfo: InfoItem;
  public goalInfo: InfoItem;
  public errorTranslationKey: string;

  constructor(private cdRef: ChangeDetectorRef,
              private http: HttpClient,
              private loginService: LoginService,
              private router: Router,
              private translateService: TranslateService,
              private userService: UserService) {
  }

  public ngOnInit(): void {
    this.loginMode = LoginMode.signIn;
    this.formGroup = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(this.LETTERS_PATTERN)]),
      surname: new FormControl('', [Validators.required, Validators.pattern(this.LETTERS_PATTERN)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required, Validators.minLength(2), Validators.max(15)]),
      usernameOrEmail: new FormControl('', [Validators.required, Validators.minLength(2), Validators.max(25)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
    this.collectFeatureInfoPoints();
  }

  public get headerSrc(): string {
    return this.HEADER_PREFIX + this.translateService.currentLang + this.HEADER_EXTENSION;
  }

  public get isSignUpMode(): boolean {
    return this.loginMode === LoginMode.signUp;
  }

  public get isSignInMode(): boolean {
    return this.loginMode === LoginMode.signIn;
  }

  public get canSignIn(): boolean {
    return this.formGroup.get('usernameOrEmail').valid && this.formGroup.get('password').valid;
  }

  public get canSignUp(): boolean {
    return this.formGroup.get('name').valid && this.formGroup.get('surname').valid
      && this.formGroup.get('email').valid && this.formGroup.get('username').valid && !this.isPasswordMismatch;
  }

  public get isPasswordMismatch(): boolean {
    return this.formGroup.get('password').touched && this.formGroup.get('passwordConfirmation').touched
      && this.formGroup.get('password').value !== this.formGroup.get('passwordConfirmation').value;
  }

  public isAllPointsFocused(points: InfoItem[]): boolean {
    return points.every((point: InfoItem) => point.isFocused);
  }

  public collectFeatureInfoPoints(): void {
    this.http.get(`${this.TRANSLATIONS_SOURCE}${this.translateService.currentLang}.json`).subscribe((translations: any) => {
      const goalsInfo: any = translations.start.info.goals;
      if (goalsInfo) {
        this.goalInfo = {
          title: goalsInfo.title,
          points: this.collectInfoPoints(goalsInfo.points),
          isFocused: goalsInfo.isFocused ?? false,
          showNumeration: goalsInfo.showNumeration ?? false,
          imageSrc: goalsInfo.imageSrc ?? false
        };
      }
      const featuresInfo: any = translations.start.info.features;
      if (featuresInfo) {
        this.featureInfo = {
          title: featuresInfo.title,
          points: this.collectInfoPoints(featuresInfo.points),
          isFocused: featuresInfo.isFocused ?? false,
          showNumeration: featuresInfo.showNumeration ?? false,
          imageSrc: featuresInfo.imageSrc ?? false
        };
      }
      this.cdRef.markForCheck();
    });
  }

  private collectInfoPoints(points: any[]): InfoItem[] {
    return points.map(point => {
      const infoPoint: InfoItem = {
        title: point.title
      };
      infoPoint.isFocused = point.isFocused ?? false;
      infoPoint.imageSrc = point.imageSrc ?? null;
      if (point.points) {
        infoPoint.points = this.collectInfoPoints(point.points);
        infoPoint.showNumeration = point.showNumeration ?? false;
      }
      return infoPoint;
    });
  }

  public signUp(): void {
    if (this.loginMode === LoginMode.signUp) {
      const registrationInfo: RegistrationInfoVO = new RegistrationInfoVO();
      registrationInfo.name = this.formGroup.get('name').value;
      registrationInfo.surname = this.formGroup.get('surname').value;
      registrationInfo.email = this.formGroup.get('email').value;
      registrationInfo.username = this.formGroup.get('username').value;
      registrationInfo.password = this.formGroup.get('password').value;
      registrationInfo.passwordConfirmation = this.formGroup.get('passwordConfirmation').value;
      const signUpObservable: Observable<number> = this.loginService.signUp(registrationInfo)
      this.processUserAuth(signUpObservable);
    } else {
      this.loginMode = LoginMode.signUp;
    }
  }

  public signIn(): void {
    if (this.loginMode === LoginMode.signIn) {
      const authorizationInfo: AuthorizationInfoVO = new AuthorizationInfoVO();
      authorizationInfo.usernameOrEmail = this.formGroup.get('usernameOrEmail').value;
      authorizationInfo.password = this.formGroup.get('password').value;
      const signInObservable: Observable<number> = this.loginService.signIn(authorizationInfo)
      this.processUserAuth(signInObservable);
    } else {
      this.loginMode = LoginMode.signIn;
    }
  }

  private processUserAuth(userAuthObservable: Observable<number>): void {
    userAuthObservable.pipe(
      catchError((error: any): Observable<any> => {
        this.errorTranslationKey = error.status === 400 ? ErrorTranslatorService.getErrorTranslation(error.error) : ErrorTranslatorService.getUnknownError();
        this.cdRef.markForCheck();
        return of(null);
      }),
      tap((response: number) => {
        if (response !== null) {
          this.userService.currentUserId = response;
          this.router.navigate([RouteNavigationService.MY_QUOTES_URL], {replaceUrl: true});
        }
      })
    ).subscribe();
  }
}
