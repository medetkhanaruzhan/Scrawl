import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../services/comment.service';
import { CommentNodeComponent } from '../comment-node/comment-node.component';
import { normalizeCommentTree } from '../../utils/build-comment-tree';

export interface CommentReplySubmit {
  postId: string;
  parentId: number | null;
  content: string;
}

export interface CommentEditSubmit {
  postId: string;
  commentId: number;
  content: string;
}

export interface CommentDeleteEvent {
  postId: string;
  commentId: number;
}

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [CommonModule, CommentNodeComponent],
  templateUrl: './comment-thread.component.html',
  styleUrls: ['./comment-thread.component.scss'],
})
export class CommentThreadComponent {
  @Input({ required: true }) comments: Comment[] = [];
  @Input({ required: true }) postId!: string;
  @Input() currentUserId: number | null = null;

  @Output() replySubmit = new EventEmitter<CommentReplySubmit>();
  @Output() editSubmit = new EventEmitter<CommentEditSubmit>();
  @Output() deleteComment = new EventEmitter<CommentDeleteEvent>();

  activeReplyId = signal<number | null>(null);
  replyDraft = signal('');
  editingCommentId = signal<number | null>(null);
  editDraft = signal('');

  /** Recomputed when `comments` input changes (template reads getter each CD cycle). */
  get tree(): Comment[] {
    return normalizeCommentTree(this.comments);
  }

  onReplyClick(commentId: number): void {
    this.activeReplyId.update((cur) => (cur === commentId ? null : commentId));
    this.replyDraft.set('');
  }

  onSendReply(commentId: number): void {
    const text = this.replyDraft().trim();
    if (!text) return;
    this.replySubmit.emit({
      postId: this.postId,
      parentId: commentId,
      content: text,
    });
    this.replyDraft.set('');
    this.activeReplyId.set(null);
  }

  onBeginEdit(ev: { id: number; content: string }): void {
    this.editingCommentId.set(ev.id);
    this.editDraft.set(ev.content);
    this.activeReplyId.set(null);
  }

  onSaveEdit(commentId: number): void {
    const text = this.editDraft().trim();
    if (!text) return;
    this.editSubmit.emit({
      postId: this.postId,
      commentId,
      content: text,
    });
    this.editingCommentId.set(null);
    this.editDraft.set('');
  }

  onCancelEdit(): void {
    this.editingCommentId.set(null);
    this.editDraft.set('');
  }

  onDeleteComment(commentId: number): void {
    this.deleteComment.emit({ postId: this.postId, commentId });
  }
}
