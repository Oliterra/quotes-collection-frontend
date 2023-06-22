import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthorizationInfoVO, RegistrationInfoVO} from "../../model/vo/supplementary.vo";
import {LoginService} from "../../service/login.service";
import {ErrorTranslatorService} from "../../model/error-translator.service";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {RouteNavigationService} from "../../routing/route-navigation.service";
import {catchError, Observable, of, tap} from "rxjs";
import {environment} from "../../../environments/environment";

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

  private readonly FONT_SIZE_STYLE_NAME: string = 'font-size';
  private readonly HEADER_PREFIX: string = '/assets/images/header_';
  private readonly HEADER_EXTENSION: string = '.svg';
  private readonly LETTERS_PATTERN: string = '[a-zA-Zа-яА-Я]+$';
  private readonly LOCALE_SWITCHER_FONT_SIZE_FACTOR: number = 0.0175;
  private readonly PIXEL_UNIT: string = 'px';
  private readonly TRANSLATIONS_SOURCE: string = '/assets/i18n/';

  @ViewChild('headerContainer')
  public headerContainerRef: ElementRef;

  public errorTranslationKey: string;
  public featureInfo: InfoItem;
  public formGroup: FormGroup;
  public goalInfo: InfoItem;
  public localeSwitcherStyle: any = {};
  public loginMode: LoginMode;

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
    this.updateLocaleSwitcherSize();
  }

  @HostListener('window:resize')
  public onResize() {
    this.updateLocaleSwitcherSize();
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
      && this.formGroup.get('email').valid && this.formGroup.get('username').valid
      && this.formGroup.get('password').valid && this.formGroup.get('passwordConfirmation').valid && !this.isPasswordMismatch;
  }

  public get isPasswordMismatch(): boolean {
    return this.formGroup.get('password').touched && this.formGroup.get('passwordConfirmation').touched
      && this.formGroup.get('password').value !== this.formGroup.get('passwordConfirmation').value;
  }

  public updateLocaleSwitcherSize(): void {
    if (this.headerContainerRef) {
      this.localeSwitcherStyle = {
        [this.FONT_SIZE_STYLE_NAME]: this.headerContainerRef.nativeElement.offsetWidth * this.LOCALE_SWITCHER_FONT_SIZE_FACTOR + this.PIXEL_UNIT
      };
    }
  }

  public setLocale(): void {
    const allLocales: string[] = environment.locales;
    const currentLocale: string = this.translateService.currentLang;
    const nextLocaleIndex: number = (allLocales.indexOf(currentLocale) + 1) % allLocales.length;
    const nextLocale: string = allLocales[nextLocaleIndex];
    this.translateService.use(nextLocale).subscribe(() => {
      this.collectFeatureInfoPoints();
    });
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
    if (this.isSignUpMode) {
      this.handleSignUp();
    } else {
      this.loginMode = LoginMode.signUp;
      this.errorTranslationKey = null;
    }
  }

  public signIn(): void {
    if (this.isSignInMode) {
      this.handleSignIn();
    } else {
      this.loginMode = LoginMode.signIn;
      this.errorTranslationKey = null;
    }
  }

  public onEnterKey(): void {
    if (this.isSignUpMode && this.canSignUp) {
      this.handleSignUp();
    }
    if (this.isSignInMode && this.canSignIn) {
      this.handleSignIn();
    }
  }

  private handleSignUp(): void {
    const registrationInfo: RegistrationInfoVO = new RegistrationInfoVO();
    registrationInfo.name = this.formGroup.get('name').value;
    registrationInfo.surname = this.formGroup.get('surname').value;
    registrationInfo.email = this.formGroup.get('email').value;
    registrationInfo.username = this.formGroup.get('username').value;
    registrationInfo.password = this.formGroup.get('password').value;
    registrationInfo.passwordConfirmation = this.formGroup.get('passwordConfirmation').value;
    const signUpObservable: Observable<number> = this.loginService.signUp(registrationInfo)
    this.processUserAuth(signUpObservable);
  }

  private handleSignIn(): void {
    const authorizationInfo: AuthorizationInfoVO = new AuthorizationInfoVO();
    authorizationInfo.usernameOrEmail = this.formGroup.get('usernameOrEmail').value;
    authorizationInfo.password = this.formGroup.get('password').value;
    const signInObservable: Observable<number> = this.loginService.signIn(authorizationInfo)
    this.processUserAuth(signInObservable);
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
