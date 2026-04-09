import {Routes} from '@angular/router';
import {Login} from './auth/login/login';
import {AdminDashboard} from './features/dashboards/admin/admin-dashboard/admin-dashboard';
import {roleGuard} from './core/guards/role.guard';
import {Unauthorized} from './features/dashboards/unauthorized/unauthorized';
import {authGuard} from './core/guards/auth.guard';
import {IcDashboard} from './features/dashboards/ic/ic-dashboard/ic-dashboard';
import {ShDashboard} from './features/dashboards/sh/sh-dashboard/sh-dashboard';
import {ZoDashboard} from './features/dashboards/zo/zo-dashboard/zo-dashboard';
import {RmDashboard} from './features/dashboards/rm/rm-dashboard/rm-dashboard';
import {BmDashboard} from './features/dashboards/bm/bm-dashboard/bm-dashboard';
import {UlDashboard} from './features/dashboards/ul/ul-dashboard/ul-dashboard';

export const routes: Routes = [
  {path: '', component: Login},
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['ADMIN']},
  },
  {
    path: 'sh',
    component: ShDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SH']},
  },
  {
    path: 'zo',
    component: ZoDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['ZO']},
  },
  {
    path: 'rm',
    component: RmDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['RM']},
  },
  {
    path: 'bm',
    component: BmDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['BM']},
  },
  {
    path: 'ul',
    component: UlDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['UL']},
  },
  {
    path: 'ic',
    component: IcDashboard,
    canActivate: [authGuard, roleGuard],
    data: {roles: ['IC']},
  },
  {path: 'unauthorized', component: Unauthorized}
];
