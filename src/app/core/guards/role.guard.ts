import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRoles = authService.getRoles();

  const hasAccess = allowedRoles.some(role => userRoles.includes(role));
  return hasAccess ? true : router.createUrlTree(['/unauthorized']);
};
