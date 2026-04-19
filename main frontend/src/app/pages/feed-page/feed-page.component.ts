import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FeedService } from '../../services/feed.service';
import { PostService, ApiPost } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentService, Comment, CreateCommentPayload } from '../../services/comment.service';
import { ScrawlCardComponent, ScrawlAction, ReplyAction, ReplyPayload, NestedReplyPayload } from '../../components/scrawl-card/scrawl-card.component';
import { CommentEditSubmit, CommentDeleteEvent } from '../../components/comment-thread/comment-thread.component';
import { NewScrawlComponent, NewScrawlPayload } from '../../components/new-scrawl/new-scrawl.component';
import { FacultySidebarComponent } from '../../components/faculty-sidebar/faculty-sidebar.component';
import { Scrawl, Reply } from '../../models/scrawl.models';
import { CommentNodeComponent } from "../../components/comment-node/comment-node.component";

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrawlCardComponent, NewScrawlComponent, FacultySidebarComponent, CommentNodeComponent],
  templateUrl: './feed-page.component.html',
  styleUrls: ['./feed-page.component.scss'],
})
export class FeedPageComponent implements OnInit {
  private feedService  = inject(FeedService);
  private postService  = inject(PostService);
  private authService  = inject(AuthService);
  private commentService = inject(CommentService);

  readonly isLoading      = this.postService.isLoading;
  readonly faculties      = this.feedService.faculties;
  readonly activeFacultyId = signal<string>('all');
  readonly activeTag       = signal<string | null>(null);
  readonly replyInputOpenByPost = signal<Record<string, boolean>>({});
  readonly repliesOpenByPost = signal<Record<string, boolean>>({});
  readonly repliesByPost = signal<Record<string, Reply[]>>({});
  readonly commentsByPostId = signal<Record<string, Comment[]>>({});

  /** Map backend ApiPost → frontend Scrawl shape for the card component */
  private readonly mappedPosts = computed<Scrawl[]>(() => {
    this.commentsByPostId();
    this.replyInputOpenByPost();
    this.repliesOpenByPost();
    return this.postService.posts().map((p) => this._mapPost(p));
  });

  readonly scrawls = computed<Scrawl[]>(() => {
    let list = this.mappedPosts();
    const fac = this.activeFacultyId();
    const tag = this.activeTag();
    if (fac !== 'all') list = list.filter(s => s.faculty === fac);
    if (tag) list = list.filter(s => s.tags?.includes(tag));
    return list;
  });

  get isFilterEmpty(): boolean {
    return this.scrawls().length === 0 && this.activeTag() !== null;
  }

  get isEmpty(): boolean {
    return this.scrawls().length === 0 && this.activeTag() === null && !this.isLoading();
  }

  ngOnInit(): void {
    this.loadPosts();
    this.feedService.loadCommunityCounts();
  }

  private loadPosts(): void {
    this.postService.getPosts(this.activeFacultyId()).subscribe({
      next: () => this.prefetchCommentsForFeed(),
    });
  }

  private prefetchCommentsForFeed(): void {
    const posts = this.postService.posts();
    if (!posts.length) {
      this.commentsByPostId.set({});
      return;
    }
    forkJoin(posts.map((p) => this.commentService.getCommentsSafe(p.id))).subscribe({
      next: (all) => {
        const map: Record<string, Comment[]> = {};
        posts.forEach((p, i) => {
          map[String(p.id)] = all[i];
        });
        this.commentsByPostId.set(map);
      },
      error: (err) => console.error('Failed to load comments for feed', err),
    });
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  onFacultyChange(id: string): void {
    this.activeFacultyId.set(id);
    this.activeTag.set(null);
    this.loadPosts();
  }

  onTagClick(tag: string): void {
    this.activeTag.set(this.activeTag() === tag ? null : tag);
  }

  clearTagFilter(): void {
    this.activeTag.set(null);
  }

  // ── Post creation ──────────────────────────────────────────────────────────
  onScrawlPublished(payload: NewScrawlPayload): void {
    this.postService.createPost({
      content: payload.content,
      mood: payload.mood,
      is_anonymous: payload.isAnonymous,
      faculty: payload.faculty,
      image: payload.image,
      tags: payload.tags,
    }).subscribe({
      next: () => {
        // Refresh community counts after successful post creation
        this.feedService.loadCommunityCounts();
      },
      error: (err) => console.error('Failed to create post:', err)
    });
  }

  // ── Card actions ─────────────────────────────────────────────────────────────
  onActionTriggered(event: ScrawlAction): void {
    const postId = parseInt(event.id, 10);
    if (isNaN(postId)) return;

    if (event.action === 'delete') {
      this.postService.deletePost(postId).subscribe({
        error: (err) => console.error('Failed to delete post:', err)
      });
    } else if (event.action === 'save') {
      this.postService.savePost(postId).subscribe({
        error: (err) => console.error('Failed to toggle save:', err)
      });
    } else if (event.action === 'rescrawl') {
      this.postService.rescrawlPost(postId).subscribe({
        error: (err) => console.error('Failed to toggle rescrawl:', err)
      });
    } else if (event.action === 'like') {
      this.postService.likePost(postId).subscribe({
        error: (err) => console.error('Failed to toggle like:', err)
      });
    } else if (event.action === 'edit') {
      const content = (event.payload?.content || '').trim();
      if (!content) return;
      this.postService.updatePost(postId, content).subscribe({
        next: (updated) => {
          this.postService.posts.update((list) => list.map((post) => (post.id === postId ? updated : post)));
        },
        error: (err) => console.error('Failed to edit post:', err)
      });
    }
  }

  onReplyTriggered(action: ReplyAction): void {
    const replyId = parseInt(action.replyId, 10);
    if (isNaN(replyId)) return;

    if (action.action === 'delete') {
      this.postService.deletePost(replyId).subscribe({
        next: () => {
          this.removeReplyFromState(action.scrawlId, action.replyId);
          this.decrementReplyCount(action.scrawlId);
        },
        error: (err) => console.error('Failed to delete reply:', err),
      });
    } else if (action.action === 'edit') {
      const content = (action.payload || '').trim();
      if (!content) return;
      this.postService.updatePost(replyId, content).subscribe({
        next: (updated) => {
          this.updateReplyInState(action.scrawlId, action.replyId, updated.content);
        },
        error: (err) => console.error('Failed to edit reply:', err),
      });
    }
  }

  private removeReplyFromState(scrawlId: string, replyId: string): void {
    this.repliesByPost.update((map) => ({
      ...map,
      [scrawlId]: this._filterReplyRecursive(map[scrawlId] || [], replyId),
    }));
  }

  private _filterReplyRecursive(replies: Reply[], replyId: string): Reply[] {
    return replies.filter(r => r.id !== replyId).map(r => ({
      ...r,
      replies: this._filterReplyRecursive(r.replies || [], replyId),
    }));
  }

  private updateReplyInState(scrawlId: string, replyId: string, newContent: string): void {
    this.repliesByPost.update((map) => ({
      ...map,
      [scrawlId]: this._patchReplyContentRecursive(map[scrawlId] || [], replyId, newContent),
    }));
  }

  private _patchReplyContentRecursive(
    replies: Reply[],
    replyId: string,
    newContent: string
  ): Reply[] {
    return replies.map((r) => {
      if (r.id === replyId) {
        return { ...r, content: newContent };
      }
      return { ...r, replies: this._patchReplyContentRecursive(r.replies || [], replyId, newContent) };
    });
  }

  private decrementReplyCount(scrawlId: string): void {
    this.postService.posts.update((list) =>
      list.map((post) =>
        post.id === parseInt(scrawlId, 10)
          ? { ...post, replies_count: Math.max(0, (post.replies_count || 0) - 1) }
          : post
      )
    );
  }

  onToggleReply(id: string): void {
    this.replyInputOpenByPost.update((map) => ({ ...map, [id]: !map[id] }));
  }
  onToggleReplies(id: string): void {
    const willOpen = !this.repliesOpenByPost()[id];
    this.repliesOpenByPost.update((map) => ({ ...map, [id]: willOpen }));
    if (!willOpen) return;

    const postId = parseInt(id, 10);
    if (isNaN(postId)) return;
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.commentsByPostId.update((map) => ({ ...map, [id]: comments }));
      },
      error: (err) => console.error('Failed to load comments:', err),
    });
  }

  onToggleNestedReply(event: { scrawlId: string; replyId: string }): void {
    this.repliesByPost.update((map) => ({
      ...map,
      [event.scrawlId]: this._toggleNestedReplyInput(map[event.scrawlId] || [], event.replyId),
    }));
  }

  onReplySubmitted(event: ReplyPayload): void {
    const postId = parseInt(event.scrawlId, 10);
    if (isNaN(postId)) {
      console.warn('[Feed] onReplySubmitted: invalid scrawlId', event.scrawlId);
      return;
    }

    const parent = event.parentId ?? null;
    console.log('Sending comment:', { postId, content: event.reply.content, parent });

    const payload: CreateCommentPayload = {
      post: postId,
      content: event.reply.content,
      parent,
    };

    this.commentService.createComment(payload).subscribe({
      next: (created) => {
        console.log('[Feed] Comment create success, refreshing list:', created);
        this.replyInputOpenByPost.update((map) => ({
          ...map,
          [event.scrawlId]: false,
        }));
        this.repliesOpenByPost.update((map) => ({
          ...map,
          [event.scrawlId]: true,
        }));
        this.commentService.getComments(postId).subscribe({
          next: (comments) => {
            console.log('[Feed] Refreshed comments for post', postId, comments);
            this.commentsByPostId.update((map) => ({ ...map, [event.scrawlId]: comments }));
          },
          error: (e) => console.error('[Feed] Failed to refresh comments', e),
        });
        this.postService.posts.update((list) =>
          list.map((post) =>
            post.id === postId
              ? { ...post, comments_count: (post.comments_count ?? 0) + 1 }
              : post
          )
        );
      },
      error: (err) => console.error('[Feed] Failed to create comment:', err),
    });
  }

  private refreshCommentsForScrawl(scrawlId: string): void {
    const postId = parseInt(scrawlId, 10);
    if (isNaN(postId)) return;
    this.commentService.getComments(postId).subscribe({
      next: (rows) => this.commentsByPostId.update((m) => ({ ...m, [scrawlId]: rows })),
      error: (e) => console.error('[Feed] Refresh comments failed', e),
    });
  }

  onCommentEdited(ev: CommentEditSubmit): void {
    this.commentService.updateComment(ev.commentId, ev.content).subscribe({
      next: () => this.refreshCommentsForScrawl(ev.postId),
      error: (e) => console.error('[Feed] Edit comment failed', e),
    });
  }

  onCommentDeleted(ev: CommentDeleteEvent): void {
    this.commentService.deleteComment(ev.commentId).subscribe({
      next: () => {
        this.refreshCommentsForScrawl(ev.postId);
        const postId = parseInt(ev.postId, 10);
        if (!isNaN(postId)) {
          this.postService.posts.update((list) =>
            list.map((p) =>
              p.id === postId
                ? { ...p, comments_count: Math.max(0, (p.comments_count ?? 0) - 1) }
                : p
            )
          );
        }
      },
      error: (e) => console.error('[Feed] Delete comment failed', e),
    });
  }

  onNestedReplySubmitted(event: NestedReplyPayload): void {
    const postId = parseInt(event.scrawlId, 10);
    const parentId = parseInt(event.replyId, 10);
    if (isNaN(postId) || isNaN(parentId)) return;

    this.commentService
      .createComment({
        post: postId,
        content: event.reply.content,
        parent: parentId,
      })
      .subscribe({
        next: () => {
          this.commentService.getComments(postId).subscribe({
            next: (comments) => {
              this.commentsByPostId.update((map) => ({ ...map, [event.scrawlId]: comments }));
            },
          });
          this.repliesOpenByPost.update((m) => ({ ...m, [event.scrawlId]: true }));
          this.postService.posts.update((list) =>
            list.map((post) =>
              post.id === postId
                ? { ...post, comments_count: (post.comments_count ?? 0) + 1 }
                : post
            )
          );
        },
        error: (err) => console.error('Failed to submit nested comment:', err),
      });
  }

  /** Normalize API faculty (slug) for UI and filtering */
  private _normalizeFacultySlug(value: string | null | undefined): string {
    const s = (value ?? '').toString().trim().toLowerCase();
    return s || 'fit';
  }

  // ── Mapping ────────────────────────────────────────────────────────────────
  private _mapPost(p: ApiPost): Scrawl {
    const displayName = p.is_anonymous
      ? 'Anonymous'
      : (`${p.author.first_name} ${p.author.last_name}`.trim() || p.author.username);

    const authorUsername = p.is_anonymous ? 'anonymous' : p.author.username;

    // Build full avatar URL if relative
    let avatar: string | undefined;
    if (p.author.avatar) {
      avatar = p.author.avatar.startsWith('http')
        ? p.author.avatar
        : `http://127.0.0.1:8000${p.author.avatar}`;
    }

    // Build full image URL if relative
    let imageUrl: string | undefined;
    if (p.image) {
      imageUrl = p.image.startsWith('http')
        ? p.image
        : `http://127.0.0.1:8000${p.image}`;
    }

    const facultySlug = this._normalizeFacultySlug(p.faculty);
    const tags = (p.tags ?? []).filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim());

    return {
      id: String(p.id),
      authorName: displayName,
      authorUsername,
      avatar,
      content: p.content,
      mood: (p.mood as any) || 'none',
      faculty: facultySlug,
      createdAt: new Date(p.created_at),
      isAnonymous: p.is_anonymous,
      isSaved: p.is_saved,
      isRescrawled: p.is_rescrawled,
      isLiked: p.is_liked,
      likeCount: p.likes_count,
      saveCount: p.saves_count,
      rescrawlCount: p.rescralws_count,
      replies_count: ('replies_count' in p ? (p as any).replies_count : 0),
      replyCount: p.comments_count ?? p.replies_count ?? 0,
      isReply: p.is_reply,
      comments: this.commentsByPostId()[String(p.id)] ?? [],
      replies: [],
      showReplyInput: !!this.replyInputOpenByPost()[String(p.id)],
      showReplies: !!this.repliesOpenByPost()[String(p.id)],
      tags,
      image: imageUrl, // Add image field for display
    };
  }

  private _mapReply(reply: ApiPost): Reply {
    const displayName = reply.is_anonymous
      ? 'Anonymous'
      : (`${reply.author.first_name} ${reply.author.last_name}`.trim() || reply.author.username);

    let avatar: string | undefined;
    if (reply.author.avatar) {
      avatar = reply.author.avatar.startsWith('http')
        ? reply.author.avatar
        : `http://127.0.0.1:8000${reply.author.avatar}`;
    }

    return {
      id: String(reply.id),
      authorName: displayName,
      authorUsername: reply.is_anonymous ? 'anonymous' : reply.author.username,
      avatar,
      content: reply.content,
      createdAt: new Date(reply.created_at),
      isAnonymous: reply.is_anonymous,
      replies: [],
      showNestedReplyInput: false,
      showNestedReplies: false,
    };
  }

  private _toggleNestedReplyInput(
    replies: Reply[],
    targetReplyId: string
  ): Reply[] {
    return replies.map((reply) => {
      if (reply.id === targetReplyId) {
        return { ...reply, showNestedReplyInput: !reply.showNestedReplyInput };
      }
      return {
        ...reply,
        replies: this._toggleNestedReplyInput(reply.replies || [], targetReplyId),
      };
    });
  }

  private _insertChildReply(
    replies: Reply[],
    parentReplyId: string,
    childReply: Reply
  ): Reply[] {
    return replies.map((reply) => {
      if (reply.id === parentReplyId) {
        return {
          ...reply,
          showNestedReplyInput: false,
          replies: [childReply, ...(reply.replies || [])],
        };
      }
      return {
        ...reply,
        replies: this._insertChildReply(reply.replies || [], parentReplyId, childReply),
      };
    });
  }
}
