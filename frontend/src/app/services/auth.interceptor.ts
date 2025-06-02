import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from './auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authTokenService = inject(AuthTokenService);
  
  if (!authTokenService.hasToken()) {
    return next(req);
  }

  const cloneRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authTokenService.getToken()}`
    }
  });
  return next(cloneRequest);
};
