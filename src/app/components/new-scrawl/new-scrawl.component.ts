import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mood } from '../../models/scrawl.models';

export interface NewScrawlPayload {
  content: string;
  mood: Mood;
  faculty: string;
  isAnonymous: boolean;
  authorName: string;
  imageUrl?: string;
  tags: string[];
}

@Component({
  selector: 'app-new-scrawl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-scrawl.component.html',
  styleUrls: ['./new-scrawl.component.scss'],
})
export class NewScrawlComponent {
  @Output() published = new EventEmitter<NewScrawlPayload>();

  content = signal('');
  mood = signal<Mood>('none');
  isAnonymous = signal(false);
  isFocused = signal(false);
  isSubmitting = signal(false);

  imageUrl = signal<string | undefined>(undefined);
  tags = signal<string[]>([]);
  tagInput = signal('');

  readonly moods: { value: Mood; label: string; emoji: string }[] = [
    { value: 'happy',  label: 'Happy',  emoji: '😊' },
    { value: 'chill',  label: 'Chill',  emoji: '😌' },
    { value: 'sad',    label: 'Sad',    emoji: '😔' },
    { value: 'angry',  label: 'Angry',  emoji: '😤' },
  ];

  readonly authorName = 'You';

  getMoodEmoji(m: Mood): string {
    const found = this.moods.find(item => item.value === m);
    return found ? found.emoji : '😐';
  }

  setMood(m: Mood): void {
    if (this.mood() === m) {
      this.mood.set('none'); // toggle off
    } else {
      this.mood.set(m);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageUrl.set(URL.createObjectURL(file));
      // Reset input so the same file could be selected again if removed
      (event.target as HTMLInputElement).value = '';
    }
  }

  removeImage(): void {
    this.imageUrl.set(undefined);
  }

  addTag(event: any): void {
    const val = this.tagInput().trim().replace(/^#/, '');
    if (val && !this.tags().includes(val) && this.tags().length < 5) { // max 5 tags
      this.tags.update(t => [...t, val]);
      this.tagInput.set('');
    }
    event.preventDefault();
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(x => x !== tag));
  }

  publish(): void {
    if (!this.content().trim() && !this.imageUrl()) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.published.emit({
        content: this.content().trim(),
        mood: this.mood(),
        faculty: 'fit',
        isAnonymous: this.isAnonymous(),
        authorName: this.isAnonymous() ? 'Anonymous' : this.authorName,
        imageUrl: this.imageUrl(),
        tags: [...this.tags()],
      });
      // reset
      this.content.set('');
      this.mood.set('none');
      this.isAnonymous.set(false);
      this.isFocused.set(false);
      this.imageUrl.set(undefined);
      this.tags.set([]);
      this.tagInput.set('');
      this.isSubmitting.set(false);
    }, 600);
  }

  get canPublish(): boolean {
    return this.content().trim().length > 0 || !!this.imageUrl();
  }

  get charCount(): number {
    return this.content().length;
  }

  readonly MAX_CHARS = 280;
}
