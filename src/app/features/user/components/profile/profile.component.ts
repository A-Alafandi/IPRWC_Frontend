import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isEditing = false;
  isSubmitting = false;
  showSuccessAnimation = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.notificationService.error('Please login to view profile');
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.profileForm.disable();
  }

  loadUserProfile(): void {
    if (this.currentUser) {
      this.userService.getUserById(this.currentUser.id).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zipCode: user.zipCode || '',
            country: user.country || ''
          });
        },
        error: (error) => {
          this.notificationService.error('Failed to load profile');
        }
      });
    }
  }

  enableEdit(): void {
    this.isEditing = true;
    this.profileForm.enable();
    // Add smooth scroll to form
    setTimeout(() => {
      const formSection = document.querySelector('.profile-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.disable();
    this.loadUserProfile(); // Reset form to original values

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isSubmitting = true;

      // Get the form values including any disabled fields
      const formValue = this.profileForm.getRawValue();

      const updateData = {
        ...formValue,
        role: this.currentUser.role // Keep the same role
      };

      this.userService.updateUser(this.currentUser.id, updateData).subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          this.isEditing = false;
          this.profileForm.disable();

          // Update local user data
          this.currentUser = updatedUser;

          // Update auth service (so header shows updated name)
          const authUser = this.authService.getCurrentUser();
          if (authUser) {
            authUser.firstName = updatedUser.firstName;
            authUser.lastName = updatedUser.lastName;
            authUser.email = updatedUser.email;
            authUser.phoneNumber = updatedUser.phoneNumber;
            authUser.address = updatedUser.address;
            authUser.city = updatedUser.city;
            authUser.state = updatedUser.state;
            authUser.zipCode = updatedUser.zipCode;
            authUser.country = updatedUser.country;

            localStorage.setItem('current_user', JSON.stringify(authUser));
          }

          // Show success animation
          this.showSuccessAnimation = true;

          // Hide success animation after 2.5 seconds
          setTimeout(() => {
            this.showSuccessAnimation = false;
          }, 2500);

          // Show notification
          this.notificationService.success('Profile updated successfully!');

          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating profile:', error);
          this.notificationService.error(error.error?.message || 'Failed to update profile');
        }
      });
    } else {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.is-invalid');
        if (firstInvalidControl) {
          firstInvalidControl.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.touched || field?.dirty));
  }

  getProfileCompletion(): number {
    if (!this.currentUser) return 0;

    const fields = [
      this.currentUser.firstName,
      this.currentUser.lastName,
      this.currentUser.email,
      this.currentUser.phoneNumber,
      this.currentUser.address,
      this.currentUser.city,
      this.currentUser.state,
      this.currentUser.zipCode,
      this.currentUser.country
    ];

    const filledFields = fields.filter(field =>
      field !== null && field !== undefined && field !== ''
    ).length;

    const totalFields = fields.length;
    return Math.round((filledFields / totalFields) * 100);
  }
}
