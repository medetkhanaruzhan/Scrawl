import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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
            <label for="studentId">Student ID</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
              <input id="studentId" type="text" formControlName="studentId" placeholder="22B030001" />
            </div>
            <div class="error-message">
              @if (shouldShowError('studentId', 'required')) { Required }
            </div>
          </div>

          <div class="form-group">
            <label for="faculty">Faculty</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <select id="faculty" formControlName="faculty">
                <option value="" disabled selected>Select</option>
                @for (f of faculties; track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
            </div>
            <div class="error-message">
              @if (shouldShowError('faculty', 'required')) { Required }
            </div>
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.1-.58a2 2 0 0 1 2.11.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input id="phoneNumber" type="tel" formControlName="phoneNumber" placeholder="+7 (707) ..." />
            </div>
            <div class="error-message">
              @if (shouldShowError('phoneNumber', 'required')) { Required }
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
            <label for="confirmPassword">Confirm</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Repeat" />
            </div>
            <div class="error-message">
              @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) { No match }
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary" [disabled]="registerForm.invalid">
          Create Account
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
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1.5rem;
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

  registerForm: FormGroup;
  faculties: string[] = ['ISE', 'SITE', 'BS', 'KMA', 'SAM', 'SSS', 'SEPI', 'SG', 'SCE', 'SMSGT'];

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      studentId: ['', Validators.required],
      faculty: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\\s.()-]{10,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
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
      console.log('Register attempt:', this.registerForm.value);
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
