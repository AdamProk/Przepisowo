import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from './login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const loginService = inject(LoginService);

  if (!loginService.isUserLoggedIn()) {
    _router.navigate(['/login']);
    return false;
  }

  return true;
};

export const loggedInAuthGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const loginService = inject(LoginService);

  if (loginService.isUserLoggedIn()) {
    _router.navigate(['/']);
    return false;
  }

  return true;
};
