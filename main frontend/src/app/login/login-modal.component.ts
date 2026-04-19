import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card auth-modal animate-scale-up">
      <button class="back-btn" (click)="close.emit()" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="auth-header">
        <h2 class="brand-title">Scrawl</h2>
        <p class="brand-subtitle">Sign in to your KBTU Scrawl account</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="identifier">Student ID or Email</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input 
              id="identifier" 
              type="text" 
              formControlName="identifier" 
              placeholder="e.g. 22B030001"
              autocomplete="username"
            />
          </div>
          <div class="error-message">
            @if (loginForm.get('identifier')?.touched && loginForm.get('identifier')?.errors?.['required']) {
              Field is required
            }
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input 
              id="password" 
              type="password" 
              formControlName="password" 
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>
          <div class="error-message">
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']) {
              Password is required
            }
          </div>
        </div>

        <div class="error-message main-error" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
          {{ isLoading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        Don't have an account? 
        <button type="button" class="link-btn" (click)="onSwitchToRegister()">Register</button>
      </div>
    </div>
  `,
  styles: [`
    .auth-modal {
      width: 100%;
      max-width: 440px;
      padding: 3rem;
      position: relative;
    }
    .brand-title {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      text-align: center;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 2.5rem;
      font-size: 0.95rem;
    }
    .back-btn {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(-2px);
    }
    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
  `]
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials = {
        login: this.loginForm.value.identifier,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 401) {
            this.errorMessage = 'Invalid student ID/email or password.';
          } else {
            this.errorMessage = 'An error occurred during login.';
          }
        }
      });
    }
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
  }
}
