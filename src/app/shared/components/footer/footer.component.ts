import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes to show/hide login link
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
