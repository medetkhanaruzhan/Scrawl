import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/** Shape returned by the backend for each post */
export interface ApiPost {
  id: number;
  content: string;
  mood: string;
  is_anonymous: boolean;
  image: string | null;
  faculty: string;
  tags?: string[];
  created_at: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  is_liked: boolean;
  is_saved: boolean;
  is_rescrawled: boolean;
  likes_count: number;
  saves_count: number;
  rescralws_count: number;
  replies_count?: number;
  comments_count?: number;
  is_reply?: boolean;
  parent?: number | null;
}

/** Community counts by faculty */
export interface CommunityCounts {
  [faculty: string]: number;
}

interface ToggleLikeResponse {
  liked: boolean;
  likes_count: number;
}

interface ToggleSaveResponse {
  saved: boolean;
  saves_count: number;
}

interface ToggleRescrawlResponse {
  rescrawled: boolean;
  rescralws_count: number;
}

interface ReplyPayload {
  content: string;
  mood?: string;
  is_anonymous?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/posts';

  readonly posts = signal<ApiPost[]>([]);
  readonly isLoading = signal(false);

  /** GET /api/posts/ - optional faculty filter */
  getPosts(faculty?: string): Observable<ApiPost[]> {
    this.isLoading.set(true);
    let url = `${this.apiUrl}/`;
    if (faculty && faculty !== 'all') {
      url += `?faculty=${faculty}`;
    }
    return this.http.get<ApiPost[]>(url).pipe(
      tap({
        next: (data) => {
          console.log('[PostService] posts fetched', data);
          this.posts.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  /** Backward-compatible alias used by existing code */
  loadPosts(): Observable<ApiPost[]> {
    return this.getPosts();
  }

  /** Load only one user's posts (for profile page) */
  loadUserPosts(userId: number): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/user/${userId}/`);
  }

  /** Load current user's posts */
  loadMyPosts(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/me/`);
  }

  /** GET /api/posts/saved/ */
  getSavedPosts(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/saved/`);
  }

  /** GET /api/posts/rescrawled/ */
  getRescrawledPosts(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/rescrawled/`);
  }

  /** GET /api/posts/user/{userId}/rescrawled/ */
  getUserRescrawledPosts(userId: number): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/user/${userId}/rescrawled/`);
  }

  /** Create a post with optional image using FormData (multipart) */
  createPost(form: { content: string; mood: string; is_anonymous: boolean; faculty?: string; image?: File; tags?: string[] }): Observable<ApiPost> {
    const formData = new FormData();

    formData.append('content', (form.content ?? '').trim());
    formData.append('mood', form.mood || '');
    formData.append('is_anonymous', String(form.is_anonymous));

    const facultySlug =
      form.faculty && form.faculty !== 'all' ? form.faculty : 'fit';
    formData.append('faculty', facultySlug);

    if (form.tags && form.tags.length) {
      formData.append('tags', JSON.stringify(form.tags));
    }

    if (form.image) {
      formData.append('image', form.image, form.image.name);
    }
    
    return this.http.post<ApiPost>(`${this.apiUrl}/`, formData).pipe(
      tap(newPost => {
        this.posts.update(list => [newPost, ...list]);
      })
    );
  }

  /** POST /api/posts/:id/like/ */
  likePost(id: number): Observable<ToggleLikeResponse> {
    return this.http.post<ToggleLikeResponse>(`${this.apiUrl}/${id}/like/`, {}).pipe(
      tap((res) => {
        this.posts.update((list) =>
          list.map((post) =>
            post.id === id
              ? { ...post, is_liked: res.liked, likes_count: res.likes_count }
              : post
          )
        );
      })
    );
  }

  /** POST /api/posts/:id/save/ */
  savePost(id: number): Observable<ToggleSaveResponse> {
    return this.http.post<ToggleSaveResponse>(`${this.apiUrl}/${id}/save/`, {}).pipe(
      tap((res) => {
        this.posts.update((list) =>
          list.map((post) =>
            post.id === id
              ? { ...post, is_saved: res.saved, saves_count: res.saves_count }
              : post
          )
        );
      })
    );
  }

  /** POST /api/posts/:id/rescrawl/ */
  rescrawlPost(id: number): Observable<ToggleRescrawlResponse> {
    return this.http.post<ToggleRescrawlResponse>(`${this.apiUrl}/${id}/rescrawl/`, {}).pipe(
      tap((res) => {
        this.posts.update((list) =>
          list.map((post) =>
            post.id === id
              ? { ...post, is_rescrawled: res.rescrawled, rescralws_count: res.rescralws_count }
              : post
          )
        );
      })
    );
  }

  /** POST /api/posts/:id/reply/ */
  replyToPost(postId: number, content: string): Observable<ApiPost> {
    const payload: ReplyPayload = { content };
    return this.http.post<ApiPost>(`${this.apiUrl}/${postId}/reply/`, payload);
  }

  /** PATCH /api/posts/:id/ */
  updatePost(id: number, content: string): Observable<ApiPost> {
    return this.http.patch<ApiPost>(`${this.apiUrl}/${id}/`, { content }).pipe(
      tap((updated) => {
        this.posts.update((list) => list.map((post) => (post.id === id ? updated : post)));
      })
    );
  }

  /** GET /api/posts/:id/replies/ */
  getReplies(postId: number): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(`${this.apiUrl}/${postId}/replies/`);
  }

  /** Delete a post by id */
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        this.posts.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  /** Get display name for a post author */
  getAuthorDisplayName(post: ApiPost): string {
    if (post.is_anonymous) return 'Anonymous';
    const { first_name, last_name, username } = post.author;
    return `${first_name} ${last_name}`.trim() || username;
  }

  /** GET /api/community-counts/ */
  getCommunityCounts(): Observable<CommunityCounts> {
    return this.http.get<CommunityCounts>('http://127.0.0.1:8000/api/community-counts/');
  }
}
