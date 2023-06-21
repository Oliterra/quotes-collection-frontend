import {Injectable} from '@angular/core';

type ErrorCodes = {
  [key: string]: string;
};

const ERROR_CODES: ErrorCodes = {
  UNKNOWN_ERROR: 'error.unknown',
  EMAIL_DUPLICATE_ERROR: 'error.registration.emailDuplicate',
  USERNAME_DUPLICATE_ERROR: 'error.registration.usernameDuplicate',
  INVALID_CREDENTIALS_ERROR: 'error.authorization.invalidCredentials'
};

@Injectable({
  providedIn: 'root'
})
export class ErrorTranslatorService {

  private static readonly errorTranslations: ErrorCodes = ERROR_CODES;

  public static getErrorTranslation(key: string): string {
    return this.errorTranslations[key] || this.getUnknownError();
  }

  public static getUnknownError(): string {
    return this.errorTranslations['UNKNOWN_ERROR'];
  }
}
