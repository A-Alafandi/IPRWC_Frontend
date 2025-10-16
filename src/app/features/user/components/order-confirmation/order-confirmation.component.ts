import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    // Use paramMap observable to handle route changes
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');

      if (orderId && !isNaN(+orderId)) {
        this.loadOrder(+orderId);
      } else {
        this.error = 'Invalid order ID';
        this.isLoading = false;
        this.order = null;
      }
    });
  }

  private loadOrder(orderId: number): void {

    const user = this.authService.getCurrentUser();

    if (user) {
      // Try to get user-specific orders first
      this.orderService.getUserOrders(user.id).subscribe({
        next: (orders) => {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            this.order = order;
            this.error = null;
          } else {

            this.loadOrderDirectly(orderId);
          }
          this.isLoading = false;
        },
        error: (error) => {
          // Fallback to direct order loading
          this.loadOrderDirectly(orderId);
        }
      });
    } else {
      this.loadOrderDirectly(orderId);
    }
  }

  private loadOrderDirectly(orderId: number): void {

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.error = null;
        this.isLoading = false;

      },
      error: (error) => {

        this.error = 'Failed to load order details';
        this.isLoading = false;
        this.order = null;
      }
    });
  }
}
