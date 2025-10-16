import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly GUEST_KEY = 'cart_guest';
  private activeStorageKey = this.GUEST_KEY;

  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() {
    const stored = this.getFromStorage(this.activeStorageKey);
    this.cartSubject.next(stored ?? this.getInitialCart());
  }

  /** Call this on app start (with existing user id if any), on login(user.id), and on logout(undefined). */
  setActiveUser(userId?: number): void {
    const prevKey = this.activeStorageKey;
    const prevWasGuest = prevKey === this.GUEST_KEY;

    // 1) switch to new key
    this.activeStorageKey = userId ? `cart_user_${userId}` : this.GUEST_KEY;

    // 2) Merge guest -> user ONCE (only when coming from guest and user cart is empty)
    if (prevWasGuest && userId) {
      const guest = this.getFromStorage(this.GUEST_KEY);
      const userCart = this.getFromStorage(this.activeStorageKey);

      if (guest && guest.items?.length && (!userCart || !userCart.items?.length)) {
        this.setToStorage(this.activeStorageKey, guest);
        // IMPORTANT: clear guest so it can't leak to the next user
        this.setToStorage(this.GUEST_KEY, this.getInitialCart());
      }
    }

    // 3) If logging out, ensure guest cart is clean (optional but safest)
    if (!userId) {
      this.setToStorage(this.GUEST_KEY, this.getInitialCart());
    }

    // 4) Rehydrate subject from the new key
    const next = this.getFromStorage(this.activeStorageKey) ?? this.getInitialCart();
    this.cartSubject.next(next);
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const cart = this.cloneCart(this.getCurrentCart());
    const existing = cart.items.find(i => i.product.id === product.id);

    if (existing) existing.quantity += quantity;
    else cart.items.push({ product, quantity });

    this.recalcAndSave(cart);
  }

  removeFromCart(productId: number): void {
    const cart = this.cloneCart(this.getCurrentCart());
    cart.items = cart.items.filter(i => i.product.id !== productId);
    this.recalcAndSave(cart);
  }

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.cloneCart(this.getCurrentCart());
    const item = cart.items.find(i => i.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.id !== productId);
    } else {
      item.quantity = quantity;
    }
    this.recalcAndSave(cart);
  }

  clearCart(): void {
    const empty = this.getInitialCart();
    this.setToStorage(this.activeStorageKey, empty);
    this.cartSubject.next(empty);
  }

  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(map(c => c.totalItems));
  }

  private getInitialCart(): Cart {
    return { items: [], totalAmount: 0, totalItems: 0 };
  }

  private recalcAndSave(cart: Cart): void {
    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
    this.cartSubject.next(cart);
    this.setToStorage(this.activeStorageKey, cart);
  }

  private cloneCart(cart: Cart): Cart {
    // structuredClone is widely supported; fallback to JSON if needed.
    try {
      return structuredClone(cart);
    } catch {
      return JSON.parse(JSON.stringify(cart)) as Cart;
    }
  }

  private getFromStorage(key: string): Cart | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Cart) : null;
    } catch {
      return null;
    }
  }

  private setToStorage(key: string, cart: Cart): void {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {
    }
  }
}
