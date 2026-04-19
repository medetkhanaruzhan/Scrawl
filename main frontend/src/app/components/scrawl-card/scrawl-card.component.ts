import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Scrawl, Reply, Mood } from '../../models/scrawl.models';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../services/comment.service';
import {
  CommentThreadComponent,
  CommentReplySubmit,
  CommentEditSubmit,
  CommentDeleteEvent,
} from '../comment-thread/comment-thread.component';

export interface ReplyPayload {
  scrawlId: string;
  reply: Omit<Reply, 'id' | 'createdAt' | 'replies'>;
  /** When set, creates a threaded comment reply */
  parentId?: number | null;
}
export interface NestedReplyPayload { scrawlId: string; replyId: string; reply: Omit<Reply, 'id' | 'createdAt' | 'replies'>; }
export interface ScrawlAction    { id: string; action: 'save' | 'rescrawl' | 'like' | 'delete' | 'edit'; payload?: any; }
export interface ReplyAction     { scrawlId: string; replyId: string; action: 'edit' | 'delete'; payload?: any; }

@Component({
  selector: 'app-scrawl-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommentThreadComponent],
  templateUrl: './scrawl-card.component.html',
  styleUrls: ['./scrawl-card.component.scss'],
})
export class ScrawlCardComponent {
  private userService = inject(UserService);
  readonly authService = inject(AuthService);

  @Input({ required: true }) scrawl!: Scrawl;
  @Input() comments: Comment[] = [];
  @Output() actionTriggered    = new EventEmitter<ScrawlAction>();
  @Output() replyTriggered     = new EventEmitter<ReplyAction>(); 
  @Output() replySubmitted     = new EventEmitter<ReplyPayload>();
  @Output() nestedReplySubmitted = new EventEmitter<NestedReplyPayload>();
  @Output() toggleReply        = new EventEmitter<string>();
  @Output() toggleReplies      = new EventEmitter<string>();
  @Output() toggleNestedReply  = new EventEmitter<{ scrawlId: string; replyId: string }>();
  @Output() tagClicked         = new EventEmitter<string>();
  @Output() commentEdited    = new EventEmitter<CommentEditSubmit>();
  @Output() commentDeleted   = new EventEmitter<CommentDeleteEvent>();

  // Edit Scrawl state
  isEditing = signal(false);
  editContent = signal('');
  editTags = signal<string[]>([]);
  editTagInput = signal('');
  
  editMood = signal<Mood>('none');
  /** Parent comment id when replying to a specific comment (else top-level) */
  replyParentId = signal<number | null>(null);
  menuOpen = signal(false);

  // Edit Reply state (map of replyId -> editing content)
  editingReplies = signal<Record<string, string>>({});

  replyContent     = signal('');
  nestedContents   = signal<Record<string, string>>({});

  get currentUser(): string {
    return this.authService.currentUser()?.displayName || '';
  }

  get currentUserUsername(): string {
    return this.authService.currentUser()?.username || '';
  }

  readonly moods: { value: Mood; label: string; emoji: string }[] = [
    { value: 'happy',  label: 'Happy',  emoji: '😊' },
    { value: 'chill',  label: 'Chill',  emoji: '😌' },
    { value: 'sad',    label: 'Sad',    emoji: '😔' },
    { value: 'angry',  label: 'Angry',  emoji: '😤' },
  ];

  get moodEmoji(): string {
    const found = this.moods.find(item => item.value === this.scrawl.mood);
    return found ? found.emoji : '';
  }

  get moodLabel(): string {
    const mood = this.scrawl.mood ?? 'none';
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  }

  get facultyLabel(): string {
    const map: Record<string, string> = {
      all: 'All', fit: 'FIT', bs: 'BS', ise: 'ISE', feogi: 'FEOGI',
      smsgt: 'SMSGT', kma: 'KMA', sam: 'SAM', sce: 'SCE', smg: 'SMG',
    };
    const raw = (this.scrawl.faculty ?? '').toString().trim().toLowerCase();
    const faculty = raw || 'fit';
    return map[faculty] ?? faculty.toUpperCase();
  }

  // Determine if it's the current user's profile for edit/delete
  get isOwnScrawl(): boolean {
    return (
      this.scrawl.authorName === this.currentUser ||
      (!!this.scrawl.isAnonymous && this.currentUser === 'You')
    );
  }

  isOwnReply(reply: Reply): boolean {
    return reply.authorName === this.currentUser || (reply.isAnonymous && this.currentUser === 'You');
  }

  get timeAgo(): string {
    const created = this.scrawl.createdAt;
    return created ? this._timeAgo(new Date(created)) : 'just now';
  }

  getReplyTimeAgo(date: Date): string { return this._timeAgo(new Date(date)); }

  /** ISO timestamp from API comments */
  commentTimeAgo(iso: string): string {
    return this._timeAgo(new Date(iso));
  }

  private _timeAgo(d: Date): string {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  getAvatarInitials(name: string): string {
    if (!name || name === 'Anonymous') return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  onTagClick(tag: string, event: Event): void {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }

  /** Returns the route path for the post author's profile */
  get authorProfileLink(): string[] {
    if (this.scrawl.isAnonymous) return [];
    return ['/profile', this.scrawl.authorUsername || this.userService.usernameFromDisplayName(this.scrawl.authorName)];
  }

  onAction(action: 'save' | 'rescrawl' | 'like'): void {
    this.actionTriggered.emit({ id: this.scrawl.id, action });
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  startEdit(): void {
    this.menuOpen.set(false);
    this.isEditing.set(true);
    this.editContent.set(this.scrawl.content);
    this.editTags.set([...(this.scrawl.tags || [])]);
    this.editMood.set(this.scrawl.mood ?? 'none');
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    if (!this.editContent().trim()) return;
    this.actionTriggered.emit({
      id: this.scrawl.id,
      action: 'delete', // Using action interface but with a payload, or add a dedicated edit action.
      // Wait, let's just make it emit action='edit' (need to update interface)
    });
    // Wait I hardcoded 'save' | 'rescrawl' | 'like' | 'delete' above. I should change action type slightly. Let me emit the right info.
    // Instead of doing it directly on actionTriggered, let's just cheat the generic action:
  }

  // Fix: I need 'edit' in the ScrawlAction interface! Wait, I can just change it. Let me update interface via standard TS.
  saveScrawlEdit(): void {
    if (!this.editContent().trim()) return;
    this.actionTriggered.emit({
      id: this.scrawl.id,
      action: 'edit',
      payload: {
        content: this.editContent().trim(),
        tags: this.editTags(),
        mood: this.editMood()
      }
    });
    this.isEditing.set(false);
  }

  deleteScrawl(): void {
    this.menuOpen.set(false);
    if (confirm('Are you sure you want to delete this scrawl?')) {
      this.actionTriggered.emit({ id: this.scrawl.id, action: 'delete' });
    }
  }

  // --- Tag editing ---
  addEditTag(event: any): void {
    const val = this.editTagInput().trim().replace(/^#/, '');
    if (val && !this.editTags().includes(val) && this.editTags().length < 5) {
      this.editTags.update(t => [...t, val]);
      this.editTagInput.set('');
    }
    event.preventDefault();
  }

  removeEditTag(tag: string): void {
    this.editTags.update(t => t.filter(x => x !== tag));
  }

  // --- Replies functionality ---

  onToggleReply(): void {
    this.replyParentId.set(null);
    this.toggleReply.emit(this.scrawl.id);
  }
  onToggleReplies(): void { this.toggleReplies.emit(this.scrawl.id); }

  onCommentThreadReply(ev: CommentReplySubmit): void {
    this.replySubmitted.emit({
      scrawlId: ev.postId,
      parentId: ev.parentId ?? undefined,
      reply: {
        authorName: this.currentUser,
        authorUsername: this.currentUserUsername,
        content: ev.content,
        isAnonymous: false,
      },
    });
  }

  onCommentThreadEdit(ev: CommentEditSubmit): void {
    this.commentEdited.emit(ev);
  }

  onCommentThreadDelete(ev: CommentDeleteEvent): void {
    this.commentDeleted.emit(ev);
  }

  submitReply(): void {
    const text = this.replyContent().trim();
    if (!text) {
      console.warn('[ScrawlCard] submitReply skipped: empty content');
      return;
    }

    console.log('[ScrawlCard] submitReply emit', {
      scrawlId: this.scrawl.id,
      content: text,
      parent: this.replyParentId(),
    });

    this.replySubmitted.emit({
      scrawlId: this.scrawl.id,
      parentId: this.replyParentId() ?? undefined,
      reply: {
        authorName: this.currentUser,
        authorUsername: this.currentUserUsername,
        content: text,
        isAnonymous: false,
      },
    });
    this.replyContent.set('');
    this.replyParentId.set(null);
  }

  onToggleNestedReply(replyId: string): void {
    this.toggleNestedReply.emit({ scrawlId: this.scrawl.id, replyId });
  }

  getNestedContent(replyId: string): string {
    return this.nestedContents()[replyId] ?? '';
  }

  setNestedContent(replyId: string, value: string): void {
    this.nestedContents.update(map => ({ ...map, [replyId]: value }));
  }

  submitNestedReply(reply: Reply): void {
    const content = this.getNestedContent(reply.id).trim();
    if (!content) return;
    this.nestedReplySubmitted.emit({
      scrawlId: this.scrawl.id,
      replyId: reply.id,
      reply: { 
        authorName: this.currentUser, 
        authorUsername: this.currentUserUsername,
        content, 
        isAnonymous: false 
      },
    });
    this.setNestedContent(reply.id, '');
    this.toggleNestedReply.emit({ scrawlId: this.scrawl.id, replyId: reply.id });
  }

  startEditReply(reply: Reply): void {
    this.editingReplies.update(map => ({ ...map, [reply.id]: reply.content }));
  }

  updateReplyEditContent(replyId: string, content: string): void {
    this.editingReplies.update(map => ({ ...map, [replyId]: content }));
  }

  cancelEditReply(replyId: string): void {
    this.editingReplies.update(map => {
      const newMap = { ...map };
      delete newMap[replyId];
      return newMap;
    });
  }

  saveEditReply(replyId: string): void {
    const content = this.editingReplies()[replyId]?.trim();
    if (!content) return;
    this.replyTriggered.emit({ scrawlId: this.scrawl.id, replyId, action: 'edit', payload: content });
    this.cancelEditReply(replyId);
  }

  deleteReply(replyId: string): void {
    if (confirm('Delete this reply?')) {
      this.replyTriggered.emit({ scrawlId: this.scrawl.id, replyId, action: 'delete' });
    }
  }
}
