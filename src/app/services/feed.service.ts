import { Injectable, signal } from '@angular/core';
import { Faculty, Scrawl, Reply, Mood } from '../models/scrawl.models';

@Injectable({ providedIn: 'root' })
export class FeedService {
  readonly isLoading = signal(true);

  constructor() {
    // Simulate network delay for skeleton loading state
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  readonly faculties = signal<Faculty[]>([
    { id: 'all',   name: 'All Communities',           shortName: 'All',   postCount: 142, description: 'Every scrawl across KBTU' },
    { id: 'fit',   name: 'IT & Engineering',           shortName: 'FIT',   postCount: 58,  description: 'CS, Software Engineering & IT' },
    { id: 'bs',    name: 'Business School',            shortName: 'BS',    postCount: 34,  description: 'Finance, management & marketing' },
    { id: 'ise',   name: 'Intl. School of Economics',  shortName: 'ISE',   postCount: 21,  description: 'Economics, trade & policy' },
    { id: 'feogi', name: 'Oil, Gas & Geosciences',     shortName: 'FEOGI', postCount: 15,  description: 'Petroleum & earth sciences' },
    { id: 'smsgt', name: 'Social Sciences',            shortName: 'SMSGT', postCount: 14,  description: 'Law, linguistics & culture' },
    { id: 'kma',   name: 'Maritime Academy',           shortName: 'KMA',   postCount: 9,   description: 'Navigation & marine engineering' },
    { id: 'sam',   name: 'Applied Mathematics',        shortName: 'SAM',   postCount: 11,  description: 'Pure & applied math sciences' },
    { id: 'sce',   name: 'Chemical Engineering',       shortName: 'SCE',   postCount: 8,   description: 'Chem processes & materials' },
    { id: 'smg',   name: 'Materials & Green Tech',     shortName: 'SMG',   postCount: 7,   description: 'Sustainability & materials science' },
  ]);

  readonly scrawls = signal<Scrawl[]>([
    {
      id: '1',
      authorName: 'Aizat Bekova',
      avatar: 'AB',
      content: 'Just survived the Data Structures midterm 🫠 the tree traversal question had me staring at a blank page for 20 min. Who else bombed it?',
      mood: 'sad',
      faculty: 'fit',
      tags: ['midterm', 'datastructures', 'fit', 'help'],
      createdAt: new Date(Date.now() - 1000 * 60 * 14),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: false,
      isLiked: false,
      likeCount: 24,
      replyCount: 3,
      rescrawlCount: 5,
      replies: [
        {
          id: 'r1',
          authorName: 'Daniyar S.',
          content: 'Bro same 😭 I wrote BFS when they wanted DFS the whole time.',
          createdAt: new Date(Date.now() - 1000 * 60 * 10),
          isAnonymous: false,
          replies: [
            {
              id: 'r1-1',
              authorName: 'Aizat Bekova',
              content: 'Exactly! And the time complexity section was brutal.',
              createdAt: new Date(Date.now() - 1000 * 60 * 8),
              isAnonymous: false,
              replies: [],
            }
          ],
        },
        {
          id: 'r2',
          authorName: 'Anonymous',
          content: "The TA said the average was 41/100. You're not alone.",
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
          isAnonymous: true,
          replies: [],
        },
      ],
    },
    {
      id: '2',
      authorName: 'Anonymous',
      avatar: '',
      content: 'The new cafeteria menu has prices that make absolutely no sense for student stipends. 2800 tenge for a bowl of soup? Seriously.',
      mood: 'angry',
      faculty: 'bs',
      tags: ['cafeteria', 'prices', 'campus', 'bs'],
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      isAnonymous: true,
      isSaved: false,
      isRescrawled: false,
      isLiked: false,
      likeCount: 67,
      replyCount: 9,
      rescrawlCount: 12,
      replies: [
        {
          id: 'r-cafe1',
          authorName: 'Sultana R.',
          content: 'I literally bring lunch from home now. Not worth it at all.',
          createdAt: new Date(Date.now() - 1000 * 60 * 38),
          isAnonymous: false,
          replies: [],
        },
        {
          id: 'r-cafe2',
          authorName: 'Anonymous',
          content: 'The portions also got smaller btw 😒',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          isAnonymous: true,
          replies: [],
        },
      ],
    },
    {
      id: '3',
      authorName: 'Miras Omarov',
      avatar: 'MO',
      content: 'Hackathon team looking for a UI/UX designer 🎨 We have the backend stack (Django + PostgreSQL) ready. DM if interested — deadline is Friday!',
      mood: 'happy',
      faculty: 'fit',
      tags: ['hackathon', 'design', 'team', 'django'],
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      isAnonymous: false,
      isSaved: true,
      isRescrawled: false,
      isLiked: true,
      likeCount: 41,
      replyCount: 6,
      rescrawlCount: 8,
      replies: [
        {
          id: 'r3',
          authorName: 'Zarina K.',
          content: "I do Figma! What's the project about?",
          createdAt: new Date(Date.now() - 1000 * 60 * 80),
          isAnonymous: false,
          replies: [
            {
              id: 'r3-1',
              authorName: 'Miras Omarov',
              content: "It's a sustainability tracking app for KBTU campus! DM'd you.",
              createdAt: new Date(Date.now() - 1000 * 60 * 75),
              isAnonymous: false,
              replies: [],
            },
          ],
        },
      ],
    },
    {
      id: '4',
      authorName: 'Kamila Nurlanovna',
      avatar: 'KN',
      content: 'Library is my second home this semester ☕ 3rd floor is surprisingly peaceful after 8pm. Highly recommend if you need dead silence to study.',
      mood: 'chill',
      faculty: 'smsgt',
      tags: ['library', 'study', 'kbtu', 'chill'],
      createdAt: new Date(Date.now() - 1000 * 60 * 200),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: true,
      isLiked: false,
      likeCount: 88,
      replyCount: 11,
      rescrawlCount: 19,
      replies: [
        {
          id: 'r4-1',
          authorName: 'Arman N.',
          content: 'Wait there are outlets on the 3rd floor right? Game changer if so.',
          createdAt: new Date(Date.now() - 1000 * 60 * 190),
          isAnonymous: false,
          replies: [
            {
              id: 'r4-1-1',
              authorName: 'Kamila Nurlanovna',
              content: 'Yes! Near the window desks. Grab a spot before 7pm though.',
              createdAt: new Date(Date.now() - 1000 * 60 * 185),
              isAnonymous: false,
              replies: [],
            },
          ],
        },
      ],
    },
    {
      id: '5',
      authorName: 'Anonymous',
      avatar: '',
      content: 'Anyone else feel like the grading rubric for the economics essay was completely arbitrary? Got 62 with no feedback whatsoever.',
      mood: 'none',
      faculty: 'ise',
      tags: ['grades', 'rant', 'ise', 'essay'],
      createdAt: new Date(Date.now() - 1000 * 60 * 300),
      isAnonymous: true,
      isSaved: false,
      isRescrawled: false,
      isLiked: false,
      likeCount: 34,
      replyCount: 4,
      rescrawlCount: 3,
      replies: [],
    },
    {
      id: '6',
      authorName: 'Berik Akhmetov',
      avatar: 'BA',
      content: 'Spring is finally here and the KBTU campus actually looks beautiful 🌸 Took some photos near Block A stairs. Pure vibes.',
      mood: 'happy',
      faculty: 'feogi',
      tags: ['spring', 'campus', 'kbtu', 'photography'],
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 1000 * 60 * 400),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: false,
      isLiked: true,
      likeCount: 102,
      replyCount: 7,
      rescrawlCount: 14,
      replies: [
        {
          id: 'r6-1',
          authorName: 'Altynay B.',
          content: 'This photo is gorgeous, which phone did you use?',
          createdAt: new Date(Date.now() - 1000 * 60 * 380),
          isAnonymous: false,
          replies: [],
        },
      ],
    },
    {
      id: '7',
      authorName: 'Nurlan Dzhaksybekov',
      avatar: 'ND',
      content: 'Our petroleum engineering lab tour today was actually insane. The equipment KBTU has is next level — didn\'t expect that honestly.',
      mood: 'happy',
      faculty: 'feogi',
      tags: ['petroleum', 'lab', 'engineering', 'feogi'],
      createdAt: new Date(Date.now() - 1000 * 60 * 600),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: true,
      isLiked: true,
      likeCount: 57,
      replyCount: 3,
      rescrawlCount: 9,
      replies: [],
    },
    {
      id: '8',
      authorName: 'Anonymous',
      avatar: '',
      content: 'Reminder: the math olympiad internal qualifier is this Thursday at 14:00 in room 304. Registration closes tonight at midnight!',
      mood: 'none',
      faculty: 'sam',
      tags: ['olympiad', 'math', 'announcement', 'sam'],
      createdAt: new Date(Date.now() - 1000 * 60 * 720),
      isAnonymous: true,
      isSaved: true,
      isRescrawled: false,
      isLiked: false,
      likeCount: 48,
      replyCount: 2,
      rescrawlCount: 22,
      replies: [
        {
          id: 'r8-1',
          authorName: 'Aigerim M.',
          content: 'Thanks for the reminder!! Almost missed this.',
          createdAt: new Date(Date.now() - 1000 * 60 * 700),
          isAnonymous: false,
          replies: [],
        },
      ],
    },
    {
      id: '9',
      authorName: 'Dana Seitkali',
      avatar: 'DS',
      content: 'Just submitted my thesis proposal on sustainable fuel alternatives 🌱 Two years of research finally down on paper. Whatever happens, proud of this.',
      mood: 'chill',
      faculty: 'sce',
      tags: ['thesis', 'research', 'sustainability', 'sce'],
      createdAt: new Date(Date.now() - 1000 * 60 * 900),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: false,
      isLiked: true,
      likeCount: 76,
      replyCount: 5,
      rescrawlCount: 6,
      replies: [],
    },
    {
      id: '10',
      authorName: 'Arlan Bekzhan',
      avatar: 'AB',
      content: 'Maritime navigation class had us simulate port entry for Aktau in a full-scale simulator today. Honestly one of the best days at uni. KMA is underrated.',
      mood: 'happy',
      faculty: 'kma',
      tags: ['kma', 'maritime', 'navigation', 'simulation'],
      imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=1000&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 1000 * 60 * 1100),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: true,
      isLiked: true,
      likeCount: 93,
      replyCount: 8,
      rescrawlCount: 17,
      replies: [
        {
          id: 'r10-1',
          authorName: 'Zhanar T.',
          content: 'KMA really is slept on. The facilities are incredible.',
          createdAt: new Date(Date.now() - 1000 * 60 * 1050),
          isAnonymous: false,
          replies: [],
        },
      ],
    },
    {
      id: '11',
      authorName: 'Anonymous',
      avatar: '',
      content: 'Hot take: the new student portal UI is actually worse than the old one. More clicks to get to anything. Who approved this design? 😤',
      mood: 'angry',
      faculty: 'fit',
      tags: ['portal', 'ux', 'complaint', 'it'],
      createdAt: new Date(Date.now() - 1000 * 60 * 1300),
      isAnonymous: true,
      isSaved: false,
      isRescrawled: false,
      isLiked: true,
      likeCount: 119,
      replyCount: 14,
      rescrawlCount: 25,
      replies: [
        {
          id: 'r11-1',
          authorName: 'Miras Omarov',
          content: 'The assignment submission flow alone takes 7 clicks minimum now. Absurd.',
          createdAt: new Date(Date.now() - 1000 * 60 * 1270),
          isAnonymous: false,
          replies: [],
        },
      ],
    },
    {
      id: '12',
      authorName: 'Sanzhar Bekmukhanov',
      avatar: 'SB',
      content: 'Green chemistry lab results came back — our biodegradable polymer prototype actually passed the tensile strength test 🧪🎉 SMG team worked so hard for this.',
      mood: 'happy',
      faculty: 'smg',
      tags: ['chemistry', 'research', 'smg', 'win'],
      createdAt: new Date(Date.now() - 1000 * 60 * 1500),
      isAnonymous: false,
      isSaved: false,
      isRescrawled: true,
      isLiked: true,
      likeCount: 64,
      replyCount: 4,
      rescrawlCount: 11,
      replies: [],
    },
  ]);

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
      list.map(s => s.id === id
        ? { ...s, isRescrawled: !s.isRescrawled, rescrawlCount: s.isRescrawled ? s.rescrawlCount - 1 : s.rescrawlCount + 1 }
        : s
      )
    );
  }

  toggleLike(id: string): void {
    this.scrawls.update(list =>
      list.map(s => s.id === id
        ? { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 }
        : s
      )
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
        ? { ...s, replies: [...s.replies, newReply], replyCount: s.replyCount + 1 }
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
        ? { ...s, replies: patchReplies(s.replies), replyCount: s.replyCount + 1 }
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
      list.map(s => s.id === scrawlId ? { ...s, replies: patchReplies(s.replies) } : s)
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
          const { newReplies, countDiff } = removeReply(s.replies);
          return { ...s, replies: newReplies, replyCount: s.replyCount - countDiff };
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
        ? { ...s, replies: patchReplies(s.replies) }
        : s
      )
    );
  }
}
