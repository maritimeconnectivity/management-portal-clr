import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const authenticated = await authService.isAuthenticated();
    if (!authenticated) {
        await router.navigate(['/login']);
        return false;
    }

    return authenticated;
};
