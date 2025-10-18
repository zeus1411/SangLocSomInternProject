import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  fullName: string;
  email: string;
  status: string;
  phoneNumber?: string;
  birthday?: Date;
  gender?: string;
  adminRoleId?: number;
  orgUnitId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'token';
  private userKey = 'user';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem(this.userKey);
      const token = localStorage.getItem(this.tokenKey);

      if (userStr && token) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.url}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.url}/api/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  updateProfile(userId: number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${environment.url}/api/auth/profile/${userId}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.url}/api/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }
}
