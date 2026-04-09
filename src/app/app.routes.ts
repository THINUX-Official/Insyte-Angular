import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {AdminDashboard} from './features/dashboards/admin/admin-dashboard/admin-dashboard';
import {roleGuard} from './core/guards/role.guard';
import {Unauthorized} from './features/dashboards/unauthorized/unauthorized';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {path: '', component: Login},
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['ADMIN']},
  },
  {path: 'unauthorized', component: Unauthorized}
];
