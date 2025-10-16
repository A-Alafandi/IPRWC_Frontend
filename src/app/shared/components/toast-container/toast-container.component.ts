import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import {
  Toast,
  NotificationService,
} from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1,
        height: '*'
      })),
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
          opacity: 0,
          height: 0
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          transform: 'translateX(0)',
          opacity: 1,
          height: '*'
        }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          transform: 'translateX(100%)',
          opacity: 0,
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0
        }))
      ])
    ])
  ]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  removeToast(id: number): void {
    this.notificationService.removeToast(id);
  }

  getToastIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    };
    return icons[type] || 'bi-info-circle-fill';
  }
}
