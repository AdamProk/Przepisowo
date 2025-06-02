import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get localStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage;
    }
    return null;
  }

  getToken(): string | null {
    return this.localStorage?.getItem('authToken') || null;
  }

  setToken(token: string): void {
    this.localStorage?.setItem('authToken', token);
  }

  removeToken(): void {
    this.localStorage?.removeItem('authToken');
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
} 