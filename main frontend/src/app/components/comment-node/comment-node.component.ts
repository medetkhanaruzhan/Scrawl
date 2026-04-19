import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../services/comment.service';

@Component({
  selector: 'app-comment-node',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentNodeComponent],
  templateUrl: './comment-node.component.html',
  styleUrls: ['./comment-node.component.scss'],
})
export class CommentNodeComponent {
  @Input({ required: true }) comment!: Comment;
  @Input() depth = 0;
  @Input() currentUserId: number | null = null;

  @Input() activeReplyId: number | null = null;
  @Input() replyDraft = '';
  @Output() replyDraftChange = new EventEmitter<string>();
  @Output() replyClick = new EventEmitter<number>();
  @Output() sendReplyClick = new EventEmitter<number>();

  @Input() editingCommentId: number | null = null;
  @Input() editDraft = '';
  @Output() editDraftChange = new EventEmitter<string>();
  @Output() beginEdit = new EventEmitter<{ id: number; content: string }>();
  @Output() saveEditClick = new EventEmitter<number>();
  @Output() cancelEditClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<number>();

  displayAuthor(c: Comment): string {
    const a = c.author;
    const full = `${a.first_name} ${a.last_name}`.trim();
    return full || a.username;
  }

  avatarInitials(c: Comment): string {
    const name = this.displayAuthor(c);
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  relativeTime(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  isOwner(c: Comment): boolean {
    return this.currentUserId != null && c.author?.id === this.currentUserId;
  }

  onReplyButton(): void {
    this.replyClick.emit(this.comment.id);
  }

  onSendReply(): void {
    this.sendReplyClick.emit(this.comment.id);
  }

  onEditStart(): void {
    this.beginEdit.emit({ id: this.comment.id, content: this.comment.content });
  }

  onDelete(): void {
    if (confirm('Delete this comment? Replies under it will be removed too.')) {
      this.deleteClick.emit(this.comment.id);
    }
  }
}
