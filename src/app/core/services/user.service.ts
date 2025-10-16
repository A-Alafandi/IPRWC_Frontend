import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';


export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}



@Injectable({ providedIn: 'root' })
export class UserService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  toggleUserRole(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/toggle-role`, null);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
}
