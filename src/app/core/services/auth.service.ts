import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment} from '../../../environments/environment';
import {LoginRequest, LoginResponse} from '../models/auth/auth-module';
import {AppPermission} from '../permissions/app-permissions';
import {RolePermissions} from '../permissions/role-permissions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload);
  }

  storeSession(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('roles', JSON.stringify(response.roles || []));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): any | null {
    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');

    if (!roles) {
      return [];
    }

    try {
      return JSON.parse(roles);
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasPermission(permission: AppPermission): boolean {
    const roles = this.getRoles();

    return roles.some(role => {
      const permissions = RolePermissions[role] || [];
      return permissions.includes(permission);
    });
  }

  hasAnyPermission(permissions: AppPermission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  getDashboardRoute(roles: string[]): string {
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('SH')) return '/sh';
    if (roles.includes('ZO')) return '/zo';
    if (roles.includes('RM')) return '/rm';
    if (roles.includes('BM')) return '/bm';
    if (roles.includes('UL')) return '/ul';
    if (roles.includes('IC')) return '/ic';

    return '/unauthorized';
  }
}
