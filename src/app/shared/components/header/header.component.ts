import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  isAdmin = false;
  currentUser: User | null = null;
  isScrolled = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
