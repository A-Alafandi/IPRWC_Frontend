import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../../core/models';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  selectedOrder: Order | null = null;
  showDetailsModal = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoading = true;
      this.orderService.getUserOrders(user.id).subscribe({
        next: (orders) => {
          this.orders = orders;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
    document.body.style.overflow = 'auto';
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const statusClasses: { [key: string]: string } = {
      [OrderStatus.PENDING]: 'bg-warning',
      [OrderStatus.PROCESSING]: 'bg-info',
      [OrderStatus.SHIPPED]: 'bg-primary',
      [OrderStatus.DELIVERED]: 'bg-success',
      [OrderStatus.CANCELLED]: 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  isStepActive(step: string): boolean {
    if (!this.selectedOrder) return false;

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(this.selectedOrder.status);
    const stepIndex = statusOrder.indexOf(step);

    return stepIndex === currentIndex;
  }

  isStepCompleted(step: string): boolean {
    if (!this.selectedOrder) return false;

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(this.selectedOrder.status);
    const stepIndex = statusOrder.indexOf(step);

    return stepIndex < currentIndex;
  }
  protected readonly OrderStatus = OrderStatus;
}
