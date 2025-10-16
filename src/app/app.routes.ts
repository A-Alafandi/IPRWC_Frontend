import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/user/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/user/components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/user/components/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/user/components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/user/components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./features/user/components/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/components/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./features/user/components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/components/product-management/product-management.component').then(m => m.ProductManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/components/order-management/order-management.component').then(m => m.OrderManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/components/user-management/user-management.component').then(m => m.UserManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'products'
  }
];
