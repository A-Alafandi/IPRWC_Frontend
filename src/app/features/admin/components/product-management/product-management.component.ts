import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../core/models';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss',
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productForm: FormGroup;
  categories: string[] = [];
  selectedCategory: string = 'ALL';
  searchTerm: string = '';
  isEditMode = false;
  editingProductId: number | null = null;
  showModal = false;
  viewMode: 'grid' | 'table' = 'table';

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      image: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

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

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Failed to load products');
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.products;

    // Apply category filter
    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }

    this.filteredProducts = filtered;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  getLowStockCount(): number {
    return this.products.filter(product => product.stock <= 10).length;
  }

  getCategoryCount(category: string): number {
    return this.products.filter(product => product.category === category).length;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      stock: 0,
    });
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    });
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.productForm.reset();
    document.body.style.overflow = 'auto';
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.isEditMode && this.editingProductId) {
        // Update existing product
        this.productService
          .updateProduct(this.editingProductId, productData)
          .subscribe({
            next: (updatedProduct) => {
              if (updatedProduct) {
                this.loadProducts();
                this.closeModal();
                this.notificationService.success('Product updated successfully!');
              }
            },
            error: (error) => {
              console.error('Error updating product:', error);
              this.notificationService.error(error.error?.message || 'Failed to update product');
            },
          });
      } else {
        // Create new product
        this.productService.createProduct(productData).subscribe({
          next: (newProduct) => {
            this.loadProducts();
            this.closeModal();
            this.notificationService.success('Product created successfully!');
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.notificationService.error(error.error?.message || 'Failed to create product');
          },
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach((key) => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (success) => {
          // @ts-ignore
          if (success) {
            this.loadProducts();
            this.notificationService.success('Product deleted successfully!');
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.notificationService.error(error.error?.message || 'Failed to delete product');
        },
      });
    }
  }
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

}
