import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from './login-modal.component';
import { RegisterModalComponent } from '../register/register-modal.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginModalComponent, RegisterModalComponent],
  template: `
    <main class="hero-container">
      <div class="hero-content">
        <div class="logo-wrapper">
      
          <h1 class="hero-title">Scrawl</h1>
        </div>
        <p class="hero-subtitle">Sign in to your KBTU Scrawl account</p>
        
        <div class="hero-actions">
          <button class="btn-primary main-cta" (click)="openLogin()">
            Sign In
          </button>
        </div>
      </div>

      <!-- Modal System -->
      <div 
        class="modal-overlay" 
        [class.active]="activeModal !== 'none'"
        (click)="closeModals()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          @if (activeModal === 'login') {
            <app-login-modal 
              (close)="closeModals()" 
              (switchToRegister)="openRegister()"
            ></app-login-modal>
          } @else if (activeModal === 'register') {
            <app-register-modal 
              (switchToLogin)="openLogin()"
              (close)="closeModals()"
            ></app-register-modal>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .hero-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
    }
    .hero-content {
      text-align: center;
      transform: translateY(-20px);
    }
    .logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 0.5rem;
    }
    .logo-icon {
      font-size: 4rem;
      background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.3));
    }
    .hero-title {
      font-size: 6rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
    }
    .main-cta {
      max-width: 200px;
      padding: 1.2rem 2.5rem;
      font-size: 1.1rem;
      box-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
    }
    .modal-content {
      position: relative;
      z-index: 1001;
    }
    @media (max-width: 768px) {
      .hero-title { font-size: 4rem; }
    }
  `]
})
export class LoginPageComponent {
  activeModal: 'none' | 'login' | 'register' = 'none';

  openLogin() {
    this.activeModal = 'login';
  }

  openRegister() {
    this.activeModal = 'register';
  }

  closeModals() {
    this.activeModal = 'none';
  }
}
