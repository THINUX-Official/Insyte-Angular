import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {Auth} from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRoles = authService.getRoles();

  const hasAccess = allowedRoles.some(role => userRoles.includes(role));
  return hasAccess ? true : router.createUrlTree(['/unauthorized']);
};
