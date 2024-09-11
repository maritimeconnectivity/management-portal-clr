
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (await authService.isAuthenticated() == false) {
        router.navigate(['/login']);
        return false;
    }

    return await authService.isAuthenticated();
};