import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Product } from '../../../../core/models';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  animations: [
    trigger('staggerSlideIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  isLoading: boolean = true;
  addingToCart: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Failed to load products');
      },
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = ['All', ...data];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.isLoading = true;

    if (category === 'All') {
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        },
      });
    } else {
      this.productService.getProductsByCategory(category).subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        },
      });
    }
  }

  addToCart(product: Product): void {
    if (product.stock === 0) return;

    this.addingToCart = product.id;

    // Simulate API call delay
    setTimeout(() => {
      this.cartService.addToCart(product, 1);
      this.addingToCart = null;

      this.notificationService.success(`Added ${product.name} to cart!`);
    }, 200);
  }

  quickView(product: Product): void {
    console.log('Quick view:', product.name);
    this.notificationService.info(`Quick view for ${product.name} - Feature coming soon!`);
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '1';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-product.jpg';
  }
}
