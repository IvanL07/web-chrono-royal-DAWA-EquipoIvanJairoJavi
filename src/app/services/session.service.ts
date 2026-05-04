import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionData {
  isLogged: boolean;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private STORAGE_KEY = 'cr_session';

  session$ = new BehaviorSubject<SessionData>(this.getSession());

  constructor() {}

  getSession(): SessionData {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : { isLogged: false, userEmail: '' };
    } catch {
      return { isLogged: false, userEmail: '' };
    }
  }

  setSession(data: SessionData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.session$.next(data);
  }

  login(email: string): void {
    this.setSession({
      isLogged: true,
      userEmail: email
    });
  }

  logout(): void {
    this.setSession({
      isLogged: false,
      userEmail: ''
    });
  }
}
