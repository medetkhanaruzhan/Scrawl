import type { Comment } from '../services/comment.service';

export type Mood = 'happy' | 'sad' | 'angry' | 'chill' | 'none';

export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  postCount: number;
  description?: string;
}

export interface Reply {
  id: string;
  authorName: string;
  authorUsername: string;
  avatar?: string;
  content: string;
  createdAt: Date;
  isAnonymous: boolean;
  replies?: Reply[];
  showNestedReplies?: boolean;
  showNestedReplyInput?: boolean;
}

export interface Scrawl {
  id: string;
  authorName: string;
  authorUsername: string;
  avatar?: string;
  content: string;
  image?: string;
  imageUrl?: string;
  comments?: Comment[];
  replies_count?: number;
  faculty?: string;
  tags?: string[];
  mood?: Mood;
  createdAt?: Date;
  isAnonymous?: boolean;
  isSaved?: boolean;
  isRescrawled?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  saveCount?: number;
  rescrawlCount?: number;
  replyCount?: number;
  replies?: Reply[];
  isReply?: boolean;
  showReplyInput?: boolean;
  showReplies?: boolean;
}
