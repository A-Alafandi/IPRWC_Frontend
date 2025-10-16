import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { OrderService } from '../../../../core/services/order.service';
import { UserService } from '../../../../core/services/user.service';
import { Order, OrderStatus, Product, User } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    processingOrders: 0,
    deliveredOrders: 0
  };

  recentOrders: Order[] = [];
  lowStockProducts: Product[] = [];
  recentUsers: User[] = [];
  isLoading = true;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAllStats();
  }
  loadAllStats(): void {
    this.isLoading = true;

    // Use forkJoin to load all data simultaneously
    forkJoin({
      products: this.productService.getAllProducts(),
      orders: this.orderService.getAllOrders(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: (data) => {
        // Process products data
        this.processProductsData(data.products);

        // Process orders data
        this.processOrdersData(data.orders);

        // Process users data
        this.processUsersData(data.users);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Process products data to extract statistics
   */
  private processProductsData(products: Product[]): void {
    this.stats.totalProducts = products.length;

    // Count low stock products (10 or fewer items)
    this.lowStockProducts = products.filter(p => p.stock <= 10);
    this.stats.lowStockProducts = this.lowStockProducts.length;
  }

  /**
   * Process orders data to extract statistics
   */
  private processOrdersData(orders: Order[]): void {
    this.stats.totalOrders = orders.length;

    // Count pending orders
    this.stats.pendingOrders = orders.filter(
      order => order.status === OrderStatus.PENDING
    ).length;

    // Count processing orders
    this.stats.processingOrders = orders.filter(
      order => order.status === OrderStatus.PROCESSING
    ).length;

    // Count delivered orders
    this.stats.deliveredOrders = orders.filter(
      order => order.status === OrderStatus.DELIVERED
    ).length;

    // Calculate total revenue (only from delivered orders)
    this.stats.totalRevenue = orders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders (last 5)
    this.recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
  private processUsersData(users: User[]): void {
    this.stats.totalUsers = users.length;

  }
}
