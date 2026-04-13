import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  username = 'aizat_k';

  logout() {
    alert('Logged out');
  }

  getInitial() {
    return this.username[0].toUpperCase();
  }
}