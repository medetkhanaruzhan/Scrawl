import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeedService } from '../../services/feed.service';
import { ScrawlCardComponent, ScrawlAction, ReplyAction, ReplyPayload, NestedReplyPayload } from '../../components/scrawl-card/scrawl-card.component';
import { NewScrawlComponent, NewScrawlPayload } from '../../components/new-scrawl/new-scrawl.component';
import { FacultySidebarComponent } from '../../components/faculty-sidebar/faculty-sidebar.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrawlCardComponent, NewScrawlComponent, FacultySidebarComponent],
  templateUrl: './feed-page.component.html',
  styleUrls: ['./feed-page.component.scss'],
})
export class FeedPageComponent {
  private feedService = inject(FeedService);

  readonly isLoading = this.feedService.isLoading;
  readonly faculties = this.feedService.faculties;
  readonly activeFacultyId = signal<string>('all');
  readonly activeTag = signal<string | null>(null);

  // We bind the computed list to the cards
  readonly scrawls = computed(() => {
    return this.feedService.getScrawlsByFaculty(this.activeFacultyId(), this.activeTag());
  });

  get isFilterEmpty(): boolean {
    return this.scrawls().length === 0 && this.activeTag() !== null;
  }

  get isEmpty(): boolean {
    return this.scrawls().length === 0 && this.activeTag() === null;
  }

  onFacultyChange(id: string): void {
    this.activeFacultyId.set(id);
    this.activeTag.set(null); // Clear tag filter on faculty switch
  }

  onTagClick(tag: string): void {
    if (this.activeTag() === tag) {
      this.activeTag.set(null); // toggle off
    } else {
      this.activeTag.set(tag);
    }
  }

  clearTagFilter(): void {
    this.activeTag.set(null);
  }

  onScrawlPublished(payload: NewScrawlPayload): void {
    this.feedService.addScrawl(payload);
  }

  onActionTriggered(event: ScrawlAction): void {
    if (event.action === 'save') {
      this.feedService.toggleSave(event.id);
    } else if (event.action === 'rescrawl') {
      this.feedService.toggleRescrawl(event.id);
    } else if (event.action === 'like') {
      this.feedService.toggleLike(event.id);
    } else if (event.action === 'delete') {
      this.feedService.deleteScrawl(event.id);
    } else if (event.action === 'edit' as any) {
      // payload contains { content, tags, mood }
      this.feedService.editScrawl(event.id, event.payload);
    }
  }

  onReplyTriggered(action: ReplyAction): void {
    if (action.action === 'delete') {
      this.feedService.deleteReply(action.scrawlId, action.replyId);
    } else if (action.action === 'edit') {
      this.feedService.editReply(action.scrawlId, action.replyId, action.payload);
    }
  }

  onToggleReply(id: string): void {
    this.feedService.toggleReplyInput(id);
  }

  onToggleReplies(id: string): void {
    this.feedService.toggleShowReplies(id);
  }

  onToggleNestedReply(event: { scrawlId: string; replyId: string }): void {
    this.feedService.toggleNestedReplyInput(event.scrawlId, event.replyId);
  }

  onReplySubmitted(event: ReplyPayload): void {
    this.feedService.addReply(event.scrawlId, event.reply);
  }

  onNestedReplySubmitted(event: NestedReplyPayload): void {
    this.feedService.addNestedReply(event.scrawlId, event.replyId, event.reply);
  }
}
