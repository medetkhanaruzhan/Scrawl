import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Faculty } from '../../models/scrawl.models';

@Component({
  selector: 'app-faculty-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faculty-sidebar.component.html',
  styleUrls: ['./faculty-sidebar.component.scss'],
})
export class FacultySidebarComponent {
  @Input() faculties: Faculty[] = [];
  @Input() activeFacultyId: string = 'all';
  @Output() facultySelected = new EventEmitter<string>();

  select(id: string): void {
    this.facultySelected.emit(id);
  }

  getAccentColor(id: string): string {
    const map: Record<string, string> = {
      all:   '#a78bfa',
      fit:   '#22d3ee',
      bs:    '#fbbf24',
      ise:   '#fb923c',
      feogi: '#34d399',
      smsgt: '#f87171',
      kma:   '#60a5fa',
      sam:   '#e879f9',
      sce:   '#4ade80',
      smg:   '#2dd4bf',
    };
    return map[id] ?? '#a78bfa';
  }
}
