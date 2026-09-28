import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const sesion = authService.obtenerSesionActual();

  // Si ya tiene sesión activa, no lo dejamos entrar al login/registro y lo enviamos a su panel
  if (sesion) {
    if (sesion.rol === 'ADMIN') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/usuario']);
    }
    return false;
  }

  return true;
};