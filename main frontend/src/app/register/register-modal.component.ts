import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card auth-modal animate-scale-up">
      <button class="back-btn" (click)="close.emit()" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="auth-header">
        <h2 class="brand-title">Join Scrawl</h2>
        <p class="brand-subtitle">Create your KBTU student account</p>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="firstName" type="text" formControlName="firstName" />
            </div>
            <div class="error-message">
              @if (shouldShowError('firstName', 'required')) { Required }
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="lastName" type="text" formControlName="lastName" />
            </div>
            <div class="error-message">
              @if (shouldShowError('lastName', 'required')) { Required }
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
              <input id="username" type="text" formControlName="username" />
            </div>
            <div class="error-message">
              @if (shouldShowError('username', 'required')) { Required }
              @else if (shouldShowError('username', 'notUnique')) { Taken }
            </div>
          </div>

          <div class="form-group">
            <label for="studentId">Student ID</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
              <input id="studentId" type="text" formControlName="studentId" />
            </div>
            <div class="error-message">
              @if (shouldShowError('studentId', 'required')) { Required }
              @else if (shouldShowError('studentId', 'notUnique')) { Taken }
            </div>
          </div>

          <div class="form-group">
            <label for="email">KBTU Email</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input id="email" type="email" formControlName="email" placeholder="you@kbtu.kz" />
            </div>
            <div class="error-message">
              @if (shouldShowError('email', 'required')) { Required }
              @else if (shouldShowError('email', 'email')) { Invalid email }
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input id="phone" type="tel" formControlName="phone" placeholder="+7 (707) 123-45-67" />
            </div>
            <div class="error-message">
              @if (shouldShowError('phone', 'required')) { Required }
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="password" type="password" formControlName="password" placeholder="Min 8 chars" />
            </div>
            <div class="error-message">
              @if (shouldShowError('password', 'required')) { Required }
              @else if (shouldShowError('password', 'minlength')) { Min 8 chars }
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Confirm password" />
            </div>
            <div class="error-message">
              @if (shouldShowError('confirmPassword', 'required')) { Required }
              @else if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) { Passwords do not match }
            </div>
          </div>

          <div class="form-group full-width">
            <label for="faculty">Faculty</label>
            <div class="input-wrapper select-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <select id="faculty" formControlName="faculty">
                <option value="" disabled selected>Select your faculty</option>
                <option value="FIT">IT & Engineering (FIT)</option>
                <option value="BS">Business School (BS)</option>
                <option value="ISE">Intl. School of Economics (ISE)</option>
                <option value="FEOGI">Oil, Gas & Geosciences (FEOGI)</option>
                <option value="SMSGT">Social Sciences (SMSGT)</option>
                <option value="KMA">Maritime Academy (KMA)</option>
                <option value="SAM">Applied Mathematics (SAM)</option>
                <option value="SCE">Chemical Engineering (SCE)</option>
                <option value="SMG">Materials & Green Tech (SMG)</option>
              </select>
            </div>
            <div class="error-message">
              @if (shouldShowError('faculty', 'required')) { Required }
            </div>
          </div>
        </div>

        <div class="error-message main-error" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <div class="auth-footer">
        Already registered? 
        <button type="button" class="link-btn" (click)="onSwitchToLogin()">Sign In</button>
      </div>
    </div>
  `,
  styles: [`
    .auth-modal {
      width: 100%;
      max-width: 580px;
      padding: 3rem;
      max-height: 90vh;
      overflow-y: auto;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 1.5rem;
    }
    .brand-title {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .brand-subtitle {
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .full-width {
      grid-column: 1 / -1;
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
      z-index: 10;
    }
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(-2px);
    }
    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required]],
      studentId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      faculty: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  shouldShowError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const val = this.registerForm.value;
      const data = {
        first_name: val.firstName,
        last_name: val.lastName,
        username: val.username,
        student_id: val.studentId,
        email: val.email,
        phone: val.phone,
        faculty: val.faculty,
        password: val.password
      };

      this.authService.register(data).subscribe({
        next: () => {
          this.isLoading = false;
          // Switch to login on success
          this.onSwitchToLogin();
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 400 && err.error?.errors) {
            // Show backend validation errors
            const errors = err.error.errors;
            let msg = 'Validation error: ';
            for (const key in errors) {
              msg += `${key}: ${errors[key].join(' ')} `;
            }
            this.errorMessage = msg;
          } else {
            this.errorMessage = 'An error occurred during registration. Please try again.';
          }
        }
      });
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
