import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;

  // Admin sẽ có fullName, user thường có name
  fullName?: string;
  name?: string;

  // User thường
  userid?: string;
  type?: string;

  email?: string;
  status?: string;
  phoneNumber?: string;
  birthday?: Date | string;
  gender?: string;
  adminRoleId?: number;
  orgUnitId?: number;

  // Được backend trả về trong token payload (role: 'admin' | 'user')
  role?: 'admin' | 'user';
}

/**
 * LoginRequest linh hoạt:
 * - Có thể truyền email + password
 * - Hoặc userid + password
 * - Hoặc username (email hoặc userid) + password
 */
export interface LoginRequest {
  email?: string;
  userid?: string;
  username?: string;
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

  /**
   * LOGIN:
   * - Nếu credentials.email có giá trị -> login admin (email + password)
   * - Nếu credentials.userid có giá trị -> login user (userid + password)
   * - Nếu credentials.username có giá trị:
   *      + Có ký tự '@' -> coi là email (admin)
   *      + Không có '@' -> coi là userid (user)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    let body: any;

    if (credentials.email) {
      // Admin login
      body = {
        email: credentials.email,
        password: credentials.password
      };
    } else if (credentials.userid) {
      // User login với userid
      body = {
        userid: credentials.userid,
        password: credentials.password
      };
    } else if (credentials.username) {
      const username = credentials.username.trim();

      body = username.includes('@')
        ? { email: username, password: credentials.password }   // admin
        : { userid: username, password: credentials.password }; // user
    } else {
      // Trường hợp xấu nhất: không có email / userid / username
      // Backend sẽ tự trả lỗi "Vui lòng nhập email hoặc userid"
      body = {
        password: credentials.password
      };
    }

    return this.http.post<AuthResponse>(`${environment.url}/api/auth/login`, body)
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
