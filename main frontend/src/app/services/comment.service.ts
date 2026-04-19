import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface CommentAuthor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface Comment {
  id: number;
  post: number;
  content: string;
  created_at: string;
  parent: number | null;
  author: CommentAuthor;
  replies: Comment[];
}

export interface CreateCommentPayload {
  post: number;
  content: string;
  parent?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api';
  /** GET ?post= / POST — canonical API */
  private commentsUrl = `${this.baseUrl}/comments/`;

  /**
   * POST /api/comments/
   * Body: { post, content, parent: null | number }
   */
  createComment(payload: CreateCommentPayload): Observable<Comment> {
    const body = {
      post: payload.post,
      content: payload.content,
      parent: payload.parent ?? null,
    };
    const hasToken = !!localStorage.getItem('access_token');
    console.log('[CommentService] Sending comment:', {
      url: this.commentsUrl,
      body,
      hasAuthHeader: hasToken,
    });
    return this.http.post<Comment>(this.commentsUrl, body).pipe(
      tap({
        next: (res) => console.log('[CommentService] Comment created:', res),
        error: (err) =>
          console.error('[CommentService] Create comment failed:', err?.status, err?.error ?? err),
      })
    );
  }

  /**
   * GET /api/comments/?post=<id>
   */
  getComments(postId: number): Observable<Comment[]> {
    const url = `${this.commentsUrl}?post=${postId}`;
    console.log('[CommentService] Fetching comments:', url);
    return this.http.get<Comment[]>(url).pipe(
      tap({
        next: (rows) =>
          console.log('[CommentService] Comments received:', { postId, count: rows?.length, rows }),
        error: (err) =>
          console.error('[CommentService] Fetch comments failed:', err?.status, err?.error ?? err),
      })
    );
  }

  /** Safe fetch: never throws — returns [] on error (e.g. for bulk prefetch). */
  getCommentsSafe(postId: number): Observable<Comment[]> {
    return this.getComments(postId).pipe(catchError(() => of([])));
  }

  /** @deprecated Use getComments — alias for existing call sites */
  getPostComments(postId: number): Observable<Comment[]> {
    return this.getComments(postId);
  }

  /** PATCH /api/comments/:id/ */
  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.commentsUrl}${commentId}/`, { content });
  }

  /** DELETE /api/comments/:id/ */
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsUrl}${commentId}/`);
  }
}
