import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';
import { CartService } from './cart.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
}

interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;


  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();

    // 🔑 If a user is already stored (page refresh), align the cart key now
    const existing = this.currentUserSubject.value;
    this.cartService.setActiveUser(existing?.id);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('auth_token');
  }
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null; // Return null if not in browser
    }

    const userJson = localStorage.getItem('current_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private setUserInStorage(user: User, token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
  }

  private clearStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === UserRole.ADMIN;
  }

  register(request: RegisterRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        const user: User = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role as UserRole,
          createdAt: new Date()
        };
        this.setUserInStorage(user, response.token);
        this.currentUserSubject.next(user);
        this.cartService.setActiveUser(user.id);
      })
    );
  }

  login(email: string, password: string): Observable<JwtResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        const user: User = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role as UserRole,
          createdAt: new Date()
        };
        this.setUserInStorage(user, response.token);
        this.currentUserSubject.next(user);
        this.cartService.setActiveUser(user.id);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.cartService.setActiveUser(undefined);

  }
}
