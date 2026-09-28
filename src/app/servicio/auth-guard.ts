import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Usamos el método que ya definido en AuthService
    const sesion = authService.obtenerSesionActual();

    // Si no hay sesión activa -> Redirigir al login
    if (!sesion) {
      router.navigate(['/login']);
      return false;
    }

    // Si hay sesión y el rol coincide con los permitidos -> Permitir paso
    if (rolesPermitidos.includes(sesion.rol)) {
      return true;
    }

    // Si está autenticado pero intenta ingresar a una ruta sin el rol adecuado
    if (sesion.rol === 'ADMIN') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/usuario']);
    }

    return false;
  };
};