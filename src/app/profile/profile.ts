import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  user = {
    username: 'aizat_k',
    studentId: '22B030001',
    email: 'aizat@kbtu.kz',
    bio: 'kbtu'
  };

  editBio = this.user.bio;

  scrawls = 2;
  likes = 1;
  avg = 0.5;
  reposts = 1;
  saved = 3;

  happy = 0;
  sad = 0;
  angry = 0;
  chill = 2;

  posts = [
    {
      content: 'Hello',
      mood: 'chill',
      likes: 0,
      reposts: 1,
      saved: 0,
      anon: true
    },
    {
      content: 'Sitting at the library, rain outside, lo-fi music... life is good 🌿',
      mood: 'chill',
      likes: 1,
      reposts: 2,
      saved: 1,
      anon: true
    }
  ];

  getInitial() {
    return this.user.username[0].toUpperCase();
  }

  saveBio() {
    this.user.bio = this.editBio;
  }
}