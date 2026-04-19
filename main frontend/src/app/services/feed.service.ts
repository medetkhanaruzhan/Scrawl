import { Injectable, inject, signal } from '@angular/core';
import { Faculty, Scrawl, Reply, Mood } from '../models/scrawl.models';
import { PostService } from './post.service';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private postService = inject(PostService);
  readonly isLoading = signal(true);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  readonly faculties = signal<Faculty[]>([
    { id: 'all',   name: 'All Communities',           shortName: 'All',   postCount: 0, description: 'Every scrawl across KBTU' },
    { id: 'fit',   name: 'IT & Engineering',           shortName: 'SITE',   postCount: 0,  description: 'CS, Software Engineering & IT' },
    { id: 'bs',    name: 'Business School',            shortName: 'BS',    postCount: 0,  description: 'Finance, management & marketing' },
    { id: 'ise',   name: 'Intl. School of Economics',  shortName: 'ISE',   postCount: 0,  description: 'Economics, trade & policy' },
    { id: 'feogi', name: 'Oil, Gas & Geosciences',     shortName: 'SEPI', postCount: 0,  description: 'Petroleum & earth sciences' },
    { id: 'smsgt', name: 'Social Sciences',            shortName: 'SMSGT', postCount: 0,  description: 'Law, linguistics & culture' },
    { id: 'kma',   name: 'Maritime Academy',           shortName: 'KMA',   postCount: 0,   description: 'Navigation & marine engineering' },
    { id: 'sam',   name: 'Applied Mathematics',        shortName: 'SAM',   postCount: 0,  description: 'Pure & applied math sciences' },
    { id: 'sce',   name: 'Chemical Engineering',       shortName: 'SCE',   postCount: 0,   description: 'Chem processes & materials' },
    { id: 'smg',   name: 'Materials & Green Tech',     shortName: 'SMG',   postCount: 0,   description: 'Sustainability & materials science' },
  ]);

  
  loadCommunityCounts(): void {
    this.postService.getCommunityCounts().subscribe({
      next: (counts) => {
        this.faculties.update(list =>
          list.map(f => ({
            ...f,
            postCount: f.id === 'all' ? (counts['ALL'] || 0) : (counts[f.id] || 0)
          }))
        );
      },
      error: (err) => console.error('Failed to load community counts:', err)
    });
  }

  readonly scrawls = signal<Scrawl[]>([]);

  getScrawlsByFaculty(facultyId: string, activeTag?: string | null): Scrawl[] {
    let filtered = this.scrawls();
    if (facultyId !== 'all') {
      filtered = filtered.filter(s => s.faculty === facultyId);
    }
    if (activeTag) {
      filtered = filtered.filter(s => s.tags?.includes(activeTag));
    }
    return filtered;
  }

  addScrawl(scrawl: Omit<Scrawl, 'id' | 'createdAt' | 'isSaved' | 'isRescrawled' | 'isLiked' | 'likeCount' | 'replyCount' | 'rescrawlCount' | 'replies' | 'showReplies' | 'showReplyInput'>): void {
    const newScrawl: Scrawl = {
      ...scrawl,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      isSaved: false,
      isRescrawled: false,
      isLiked: false,
      likeCount: 0,
      replyCount: 0,
      rescrawlCount: 0,
      replies: [],
    };
    this.scrawls.update(list => [newScrawl, ...list]);
  }

  deleteScrawl(id: string): void {
    this.scrawls.update(list => list.filter(scrawl => scrawl.id !== id));
  }

  editScrawl(id: string, updates: Partial<Scrawl>): void {
    this.scrawls.update(list => list.map(scrawl => scrawl.id === id ? { ...scrawl, ...updates } : scrawl));
  }

  toggleSave(id: string): void {
    this.scrawls.update(list =>
      list.map(s => s.id === id ? { ...s, isSaved: !s.isSaved } : s)
    );
  }

  toggleRescrawl(id: string): void {
    this.scrawls.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        const n = s.rescrawlCount ?? 0;
        return { ...s, isRescrawled: !s.isRescrawled, rescrawlCount: s.isRescrawled ? n - 1 : n + 1 };
      })
    );
  }

  toggleLike(id: string): void {
    this.scrawls.update(list =>
      list.map(s => {
        if (s.id !== id) return s;
        const n = s.likeCount ?? 0;
        return { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? n - 1 : n + 1 };
      })
    );
  }

  addReply(scrawlId: string, reply: Omit<Reply, 'id' | 'createdAt' | 'replies'>): void {
    const newReply: Reply = {
      ...reply,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      replies: [],
    };
    this.scrawls.update(list =>
      list.map(s => s.id === scrawlId
        ? { ...s, replies: [...(s.replies ?? []), newReply], replyCount: (s.replyCount ?? 0) + 1 }
        : s
      )
    );
  }

  addNestedReply(scrawlId: string, replyId: string, nestedReply: Omit<Reply, 'id' | 'createdAt' | 'replies'>): void {
    const newNested: Reply = {
      ...nestedReply,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      replies: [],
    };

    const patchReplies = (replies: Reply[]): Reply[] =>
      replies.map(r => {
        if (r.id === replyId) {
          return { ...r, replies: [...(r.replies ?? []), newNested] };
        }
        return { ...r, replies: patchReplies(r.replies ?? []) };
      });

    this.scrawls.update(list =>
      list.map(s => s.id === scrawlId
        ? { ...s, replies: patchReplies(s.replies ?? []), replyCount: (s.replyCount ?? 0) + 1 }
        : s
      )
    );
  }

  editReply(scrawlId: string, replyId: string, newContent: string): void {
    const patchReplies = (replies: Reply[]): Reply[] =>
      replies.map(r => {
        if (r.id === replyId) return { ...r, content: newContent };
        return { ...r, replies: patchReplies(r.replies ?? []) };
      });

    this.scrawls.update(list =>
      list.map(s => s.id === scrawlId ? { ...s, replies: patchReplies(s.replies ?? []) } : s)
    );
  }

  deleteReply(scrawlId: string, replyId: string): void {
    const removeReply = (replies: Reply[]): { newReplies: Reply[], countDiff: number } => {
      let diff = 0;
      const newReplies = replies.filter(r => {
        if (r.id === replyId) {
          diff++;
          return false;
        }
        return true;
      }).map(r => {
        if (r.replies && r.replies.length > 0) {
          const { newReplies: nested, countDiff } = removeReply(r.replies);
          diff += countDiff;
          return { ...r, replies: nested };
        }
        return r;
      });
      return { newReplies, countDiff: diff };
    };

    this.scrawls.update(list =>
      list.map(s => {
        if (s.id === scrawlId) {
          const { newReplies, countDiff } = removeReply(s.replies ?? []);
          return { ...s, replies: newReplies, replyCount: (s.replyCount ?? 0) - countDiff };
        }
        return s;
      })
    );
  }

  toggleReplyInput(id: string): void {
    this.scrawls.update(list =>
      list.map(s => s.id === id ? { ...s, showReplyInput: !s.showReplyInput, showReplies: true } : s)
    );
  }

  toggleShowReplies(id: string): void {
    this.scrawls.update(list =>
      list.map(s => s.id === id ? { ...s, showReplies: !s.showReplies } : s)
    );
  }

  toggleNestedReplyInput(scrawlId: string, replyId: string): void {
    const patchReplies = (replies: Reply[]): Reply[] =>
      replies.map(r => {
        if (r.id === replyId) {
          return { ...r, showNestedReplyInput: !r.showNestedReplyInput };
        }
        return { ...r, replies: patchReplies(r.replies ?? []) };
      });

    this.scrawls.update(list =>
      list.map(s => s.id === scrawlId
        ? { ...s, replies: patchReplies(s.replies ?? []) }
        : s
      )
    );
  }
}
