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
  avatar?: string;
  content: string;
  createdAt: Date;
  isAnonymous: boolean;
  replies?: Reply[];          // nested replies
  showNestedReplies?: boolean;
  showNestedReplyInput?: boolean;
}

export interface Scrawl {
  id: string;
  authorName: string;
  avatar?: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  mood: Mood;
  faculty: string;
  createdAt: Date;
  isAnonymous: boolean;
  isSaved: boolean;
  isRescrawled: boolean;
  isLiked: boolean;
  likeCount: number;
  replyCount: number;
  rescrawlCount: number;
  replies: Reply[];
  showReplies?: boolean;
  showReplyInput?: boolean;
}
