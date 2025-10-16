import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cart } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service'; // Import UserService
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    totalAmount: 0,
    totalItems: 0
  };

  checkoutForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  private cartSubscription: Subscription | null = null;
  private orderCompleted = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService, // Inject UserService
    private router: Router,
    private notificationService: NotificationService
  ) {


    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {

    // Load cart
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;

      // Only redirect if cart is empty AND we haven't completed an order
      if (cart.items.length === 0 && !this.orderCompleted) {
        this.notificationService.warning('Your cart is empty!');
        this.router.navigate(['/products']);
      }
    });

    // Load complete user profile using UserService
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.id) {
      this.userService.getUserById(currentUser.id).subscribe({
        next: (userProfile) => {

          this.prefillCheckoutForm(userProfile);
          this.isLoading = false;
        },
        error: (error) => {
          this.prefillCheckoutForm(currentUser);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  private prefillCheckoutForm(user: any): void {
    const formData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      country: user.country || ''
    };
    this.checkoutForm.patchValue(formData);
  }

  onSubmit(): void {

    if (this.checkoutForm.valid && this.cart.items.length > 0) {
      const user = this.authService.getCurrentUser();

      if (!user) {
        this.notificationService.error('Please login to complete your order');
        this.router.navigate(['/login']);
        return;
      }

      this.isSubmitting = true;

      // Prepare shipping address
      const formValues = this.checkoutForm.value;
      const shippingAddress = `${formValues.address}, ${formValues.city}, ${formValues.state} ${formValues.zipCode}, ${formValues.country}`;

      // Prepare order items
      const orderItems = this.cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // Create order request
      const orderRequest = {
        items: orderItems,
        shippingAddress: shippingAddress
      };

      this.orderService.createOrder(user.id, orderRequest).subscribe({
        next: (order) => {
          this.notificationService.success('Order placed successfully! Order ID: #' + order.id);

          // Set order completed flag to prevent redirect
          this.orderCompleted = true;

          // Clear cart
          this.cartService.clearCart();
          // Ensure order.id is a valid number before redirecting
          if (order && order.id && !isNaN(order.id)) {
            this.router.navigate(['/order-confirmation', order.id]);
          } else {
            this.notificationService.error('Order placed but failed to load confirmation. Please check your orders.');
            this.router.navigate(['/orders']);
          }

          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          this.notificationService.error(error.error?.error || 'Failed to place order. Please try again.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });

      this.notificationService.warning('Please fill in all required fields');
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }
}
