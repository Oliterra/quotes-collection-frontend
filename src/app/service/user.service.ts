import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public get currentUserId(): number {
    return 1;
  }

  public get isUserLoggedIn(): boolean {
    return true;
  }
}
