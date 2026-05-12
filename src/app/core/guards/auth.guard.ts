import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {Auth} from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.isLoggedIn() ? true : router.createUrlTree(['/']);
}
