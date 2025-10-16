import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserRole } from '../../../../core/models';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedRole: string = 'ALL';
  searchTerm: string = '';
  userForm: FormGroup;
  isEditMode = false;
  editingUserId: number | null = null;
  showModal = false;
  selectedUser: User | null = null;
  showDetailsModal = false;

  userRoles = Object.values(UserRole);
  UserRole = UserRole;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      role: [UserRole.USER, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.error('Failed to load users');
      }
    });
  }

  applyFilters(): void {
    let filtered = this.users;

    // Apply role filter
    if (this.selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    this.filteredUsers = filtered;
  }

  filterByRole(role: string): void {
    this.selectedRole = role;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === UserRole.ADMIN).length;
  }


  getRoleCount(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
    document.body.style.overflow = 'auto';
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      if (this.isEditMode && this.editingUserId) {
        // Update existing user
        this.userService.updateUser(this.editingUserId, userData).subscribe({
          next: (updatedUser) => {
            if (updatedUser) {
              this.loadUsers();
              this.closeModal();
              this.notificationService.success('User updated successfully!');
            }
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.notificationService.error(error.error?.message || 'Failed to update user');
          },
        });
      } else {
        // Create new user
        this.userService.createUser(userData).subscribe({
          next: (newUser) => {
            this.loadUsers();
            this.closeModal();
            this.notificationService.success('User created successfully!');
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.notificationService.error(error.error?.message || 'Failed to create user');
          },
        });
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  toggleRole(user: User): void {
    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;

    if (confirm(`Change ${user.firstName} ${user.lastName}'s role to ${newRole}?`)) {
      this.userService.toggleUserRole(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.notificationService.success('User role updated successfully!');
        },
        error: (error) => {
          console.error('Error toggling user role:', error);
          this.notificationService.error(error.error?.message || 'Failed to update user role');
        },
      });
    }
  }

  deleteUser(user: User): void {
    if (user.id === 1) {
      this.notificationService.warning('Cannot delete the system administrator account');
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (success) => {
          // @ts-ignore
          if (success) {
            this.loadUsers();
            this.notificationService.success('User deleted successfully!');
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.notificationService.error(error.error?.message || 'Failed to delete user');
        },
      });
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
