import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginRequest, LoginResponse} from "../models/auth/auth-module";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload);
  }

  storeSession(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('roles', JSON.stringify(response.roles));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  getDashboardRoute(roles: string[]): string {
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('IC')) return '/ic';
    if (roles.includes('UL')) return '/ul';
    if (roles.includes('BM')) return '/bm';
    if (roles.includes('RM')) return '/rm';
    if (roles.includes('ZO')) return '/zo';
    if (roles.includes('SH')) return '/sh';
    return '/unauthorized';
  }
}
