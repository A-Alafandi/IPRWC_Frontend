import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../../../core/models';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss',
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'ALL';
  searchTerm: string = '';
  selectedOrder: Order | null = null;
  showDetailsModal = false;

  // Make OrderStatus enum available in template
  orderStatuses = Object.values(OrderStatus);

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    // Add entrance animations
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.notificationService.error('Failed to load orders');
      }
    });
  }

  applyFilters(): void {
    let filtered = this.orders;

    // Apply status filter
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }


    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchLower) ||
        order.user.firstName.toLowerCase().includes(searchLower) ||
        order.user.lastName.toLowerCase().includes(searchLower) ||
        order.user.email.toLowerCase().includes(searchLower)
      );
    }

    this.filteredOrders = filtered;
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }
  getStatusCount(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }
  getTotalRevenue(): string {
    const total = this.orders.reduce((sum, order) => {
      // Only count completed orders (DELIVERED)
      if (order.status === OrderStatus.DELIVERED) {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);
    return total.toFixed(2);
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

  updateOrderStatus(orderId: number, newStatus: OrderStatus): void {
    if (confirm(`Are you sure you want to update the order status to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: (updatedOrder) => {
          if (updatedOrder) {
            const index = this.orders.findIndex(o => o.id === orderId);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            }
            if (this.selectedOrder && this.selectedOrder.id === orderId) {
              this.selectedOrder = updatedOrder;
            }
            this.applyFilters();
            this.notificationService.success(`Order status updated to ${newStatus}`);
            this.closeDetailsModal();
          }
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          this.notificationService.error(error.error?.message || 'Failed to update order status');
        },
      });
    }
  }

}
