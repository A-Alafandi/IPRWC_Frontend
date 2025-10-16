import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showOptionalFields = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      phoneNumber: ['']
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
    }
  }

  toggleOptionalFields(): void {
    this.showOptionalFields = !this.showOptionalFields;
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return 'weak';

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return 'strong';
    } else if (password.length >= 6 && ((hasLetters && hasNumbers) || (hasLetters && hasSpecial))) {
      return 'medium';
    }
    return 'weak';
  }

  passwordsMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.passwordsMismatch()) {
      this.isLoading = true;
      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Registration successful! Welcome to MyShop!');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.error?.message || 'Registration failed. Please try again.');
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });

      if (this.passwordsMismatch()) {
        this.notificationService.error('Passwords do not match!');
      }
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }
}
