import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  phone: string;
  bio: string;
  avatar?: string;
  displayName: string;
  studentId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  readonly currentUser = signal<AuthUser | null>(null);

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isCurrentUser(username: string): boolean {
    const user = this.currentUser();
    return user ? user.username === username : false;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access);
        if (res.refresh) {
          localStorage.setItem('refresh_token', res.refresh);
        }
        this._mapAndSetUser(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/`).pipe(
      tap((user: any) => {
        this._mapAndSetUser(user);
      })
    );
  }

  /** PATCH /api/auth/me/ with arbitrary fields  */
  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/`, data).pipe(
      tap((user: any) => {
        this._mapAndSetUser(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
  }


  updateBio(bio: string): void {
    const user = this.currentUser();
    if (user) this.currentUser.set({ ...user, bio });
  }

  updateAvatar(avatar: string): void {
    const user = this.currentUser();
    if (user) this.currentUser.set({ ...user, avatar });
  }

  /**
   * Map the flat API response (with direct faculty/phone/bio/avatar)
   * to our AuthUser shape.
   */
  private _mapAndSetUser(apiUser: any) {
    if (!apiUser) return;

    let avatar: string | undefined;
    if (apiUser.avatar) {
      avatar = apiUser.avatar.startsWith('http')
        ? apiUser.avatar
        : `http://127.0.0.1:8000${apiUser.avatar}`;
    }

    const mapped: AuthUser = {
      id:           apiUser.id,
      username:     apiUser.username,
      email:        apiUser.email,
      student_id:   apiUser.student_id,
      first_name:   apiUser.first_name || '',
      last_name:    apiUser.last_name || '',
      faculty:      apiUser.faculty || '',
      phone:        apiUser.phone || '',
      bio:          apiUser.bio || '',
      avatar,
      // Aliases
      displayName:  `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.username,
      studentId:    apiUser.student_id,
    };
    this.currentUser.set(mapped);
  }
}
