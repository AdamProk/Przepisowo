import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage !== 'undefined') {
    const myToken = localStorage.getItem('authToken');
    if (!myToken) {
        return next(req);
    }
    const cloneRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${myToken}`
        }
    });
    return next(cloneRequest);
}
return next(req);
};
