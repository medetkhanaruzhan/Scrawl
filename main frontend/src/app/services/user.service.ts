import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';

export interface UserProfile {
  username: string;
  displayName: string;
  studentId: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
  faculty: string;
  isFollowed?: boolean;
}

export interface FollowUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface FollowStatus {
  is_following: boolean;
}

export interface UserByUsername {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string;
  followers_count?: number;
  following_count?: number;
}

/**
 * User service with backend API integration for follow system
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  // Cache for follow counts per user
  private followCounts = signal<Record<number, FollowCounts>>({});
  private followStatus = signal<Record<number, boolean>>({});

  /** Get user by username */
  getUserByUsername(username: string): Observable<UserByUsername> {
    return this.http.get<UserByUsername>(`${this.apiUrl}/by-username/${username}/`);
  }

  /** Toggle follow/unfollow for a user */
  followUser(userId: number): Observable<FollowStatus> {
    return this.http.post<FollowStatus>(`${this.apiUrl}/${userId}/follow/`, {}).pipe(
      tap((res) => {
        // Update cached status
        this.followStatus.update((map) => ({ ...map, [userId]: res.is_following }));
        // Update counts optimistically
        this.followCounts.update((map) => {
          const current = map[userId] || { followers_count: 0, following_count: 0 };
          return {
            ...map,
            [userId]: {
              ...current,
              followers_count: res.is_following
                ? current.followers_count + 1
                : Math.max(0, current.followers_count - 1),
            },
          };
        });
      })
    );
  }

  /** Get list of users who follow this user */
  getFollowers(userId: number): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.apiUrl}/${userId}/followers/`);
  }

  /** Get list of users this user follows */
  getFollowing(userId: number): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.apiUrl}/${userId}/following/`);
  }

  /** Check if current user follows target user */
  getFollowStatus(userId: number): Observable<FollowStatus> {
    return this.http.get<FollowStatus>(`${this.apiUrl}/${userId}/follow-status/`).pipe(
      tap((res) => {
        this.followStatus.update((map) => ({ ...map, [userId]: res.is_following }));
      })
    );
  }

  /** Get follower and following counts for a user */
  getFollowCounts(userId: number): Observable<FollowCounts> {
    return this.http.get<FollowCounts>(`${this.apiUrl}/${userId}/follow-counts/`).pipe(
      tap((res) => {
        this.followCounts.update((map) => ({ ...map, [userId]: res }));
      })
    );
  }

  /** Get cached follow counts */
  getCachedFollowCounts(userId: number): FollowCounts | null {
    return this.followCounts()[userId] || null;
  }

  /** Get cached follow status */
  getCachedFollowStatus(userId: number): boolean | null {
    return this.followStatus()[userId] ?? null;
  }

  // Legacy compatibility methods
  checkUnique(field: 'username' | 'studentId', value: string): boolean {
    return true; // Always return true for now - backend validates
  }

  getProfile(username: string): UserProfile | undefined {
    return undefined; // Deprecated - use AuthService or API directly
  }

  /** Slug a display name to a username (for feed → profile navigation) */
  usernameFromDisplayName(displayName: string): string {
    return displayName.toLowerCase().replace(/\s+/g, '_');
  }

  toggleFollow(username: string): void {
    // Deprecated - use followUser(userId) instead
  }

  isFollowing(username: string): boolean {
    return false; // Deprecated - use getFollowStatus(userId) instead
  }

  getFollowersCount(username: string): number {
    return 0; // Deprecated - use getFollowCounts(userId) instead
  }

  getFollowingCount(username: string): number {
    return 0; // Deprecated - use getFollowCounts(userId) instead
  }
}
