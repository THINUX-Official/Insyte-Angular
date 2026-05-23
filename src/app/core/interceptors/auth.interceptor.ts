import {HttpInterceptorFn} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // fallback support for backend testing
  if (username) {
    headers['X-Username'] = username;
  }

  if (!Object.keys(headers).length) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: headers
  });

  return next(authReq);
};
