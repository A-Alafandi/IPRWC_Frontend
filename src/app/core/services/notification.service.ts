import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();
  private nextId = 1;

  constructor() {}

  private addToast(
    message: string,
    type: Toast['type'],
    duration: number = 3000
  ): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.addToast(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.addToast(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.addToast(message, 'info', duration);
  }

  removeToast(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id));
  }
}
