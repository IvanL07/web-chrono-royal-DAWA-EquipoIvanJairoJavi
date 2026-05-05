import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionData {
  isLogged: boolean;
  userEmail: string;
}

export interface UserData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private SESSION_KEY = 'cr_session';
  private USERS_KEY = 'cr_users';

  session$ = new BehaviorSubject<SessionData>(this.getSession());

  constructor() {}

  getSession(): SessionData {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : { isLogged: false, userEmail: '' };
    } catch {
      return { isLogged: false, userEmail: '' };
    }
  }

  private getUsers(): UserData[] {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: UserData[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  userExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  register(email: string, password: string): boolean {
    if (this.userExists(email)) {
      return false;
    }

    const users = this.getUsers();

    users.push({
      email,
      password
    });

    this.saveUsers(users);
    this.login(email);

    return true;
  }

  loginWithPassword(email: string, password: string): boolean {
    const users = this.getUsers();

    const user = users.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      return false;
    }

    this.login(email);
    return true;
  }

  setSession(data: SessionData): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
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
