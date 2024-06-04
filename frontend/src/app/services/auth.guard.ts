import { CanActivateFn, Router} from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const _router=inject(Router);

  if (typeof localStorage !== 'undefined') {
      let myToken = localStorage.getItem('authToken');
      if (myToken) {
          return true;
      }
      _router.navigate(['/login']);
      return false;
  }
  return true;
};
export const loggedInAuthGuard: CanActivateFn = (route, state) => {
  const _router=inject(Router);
  if (typeof localStorage !== 'undefined') {
      let myToken = localStorage.getItem('authToken');
      if (myToken) {
          _router.navigate(['/']);
          return false;
      }
      return true;
  }
  return true;
};
