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

  storeSession(response: LoginResponse, loginUsername?: string): void {
    if (!response?.token) {
      throw new Error('Login token not found in response');
    }

    const normalizedRoles = this.normalizeRoles(response.roles || response.user?.roles || []);

    const user = {
      id: response.id || response.user?.id,
      username: response.username || response.user?.username || loginUsername || '',
      email: response.email || response.user?.email || '',
      phone: response.phone || response.user?.phone || '',
      nickname: response.nickname || response.user?.nickname || response.user?.fullName || '',
      status: response.status || response.user?.status || '',
      roles: normalizedRoles,
      supervisorId: response.user?.supervisorId,
      supervisorUsername: response.user?.supervisorUsername
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('tokenType', response.tokenType || 'Bearer');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('roles', JSON.stringify(normalizedRoles));
    localStorage.setItem('username', user.username || '');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
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

  getCurrentUsername(): string {
    const user = this.getCurrentUser();

    if (user?.username) {
      return user.username;
    }

    return localStorage.getItem('username') || '';
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');

    if (!roles) {
      return [];
    }

    try {
      return this.normalizeRoles(JSON.parse(roles));
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(this.normalizeRole(role));
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
    const normalizedRoles = this.normalizeRoles(roles);

    if (normalizedRoles.includes('ADMIN')) return '/admin';
    if (normalizedRoles.includes('SH')) return '/sh';
    if (normalizedRoles.includes('ZO')) return '/zo';
    if (normalizedRoles.includes('RM')) return '/rm';
    if (normalizedRoles.includes('BM')) return '/bm';
    if (normalizedRoles.includes('UL')) return '/ul';
    if (normalizedRoles.includes('IC')) return '/ic';

    return '/unauthorized';
  }

  private normalizeRoles(roles: string[]): string[] {
    return roles.map(role => this.normalizeRole(role));
  }

  private normalizeRole(role: string): string {
    return String(role || '')
      .trim()
      .toUpperCase()
      .replace('ROLE_', '');
  }
}
