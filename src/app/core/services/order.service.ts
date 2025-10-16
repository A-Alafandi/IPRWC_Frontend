import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from '../models';
import { environment } from '../../../environments/environment';

interface OrderRequest {
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  createOrder(userId: number, orderRequest: OrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/user/${userId}`, orderRequest);
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, null, {
      params: { status }
    });
  }
}
