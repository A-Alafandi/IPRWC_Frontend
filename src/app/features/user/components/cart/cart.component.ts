import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cart, CartItem } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
  };

  showSuccessToast = false;
  successMessage = '';
  private destroy$ = new Subject<void>();
  private toastTimeout: any;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        this.cart = cart;
      });

    // Add entrance animations
    this.animateOnLoad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: number, newQuantity: number): void {
    this.cartService.updateQuantity(productId, newQuantity);
    this.showToast('Cart updated successfully');
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: number): void {
    // Add exit animation before removing
    const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (itemElement) {
      itemElement.classList.add('removing');

      setTimeout(() => {
        this.cartService.removeFromCart(productId);
        this.showToast('Item removed from cart');
      }, 300);
    } else {
      this.cartService.removeFromCart(productId);
      this.showToast('Item removed from cart');
    }
  }

  /**
   * Clear entire cart with confirmation
   */
  clearCart(): void {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      this.cartService.clearCart();
      this.showToast('Cart cleared successfully');
    }
  }

  /**
   * Increase item quantity
   */
  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stock) {
      this.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  /**
   * Decrease item quantity
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  /**
   * Show success toast notification
   */
  private showToast(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;

    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Auto-hide after 3 seconds
    this.toastTimeout = setTimeout(() => {
      this.showSuccessToast = false;
    }, 1000);
  }

  private animateOnLoad(): void {
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }
}
