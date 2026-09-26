import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../entidades/usuario';
import { Admin } from '../entidades/admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlLogin = 'http://localhost:8080/IniciarSesion';

  // Maneja la sesión global de la aplicación (Usuario o Admin)
  sesion$ = new BehaviorSubject<Usuario | Admin | null>(this.leerSesionGuardada());

  constructor(private http: HttpClient) { }

  // 1. Enviar credenciales
  autenticar(credenciales: { documento: string; password: string }): Observable<any> {
    return this.http.post<any>(this.urlLogin, credenciales).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
    );
  }

  // 2. Guardar sesión activa
  guardarSesion(datos: Usuario | Admin): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sesion_activa', JSON.stringify(datos));
    }
    this.sesion$.next(datos);
  }

  // 3. Obtener el usuario/admin actual
  obtenerSesionActual(): Usuario | Admin | null {
    return this.sesion$.value;
  }

  // 4. Cerrar sesión
  cerrarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('sesion_activa');
    }
    this.sesion$.next(null);
  }

  // Leer sesión guardada al recargar
  private leerSesionGuardada(): Usuario | Admin | null {
    if (typeof sessionStorage !== 'undefined') {
      const guardado = sessionStorage.getItem('sesion_activa');
      if (guardado) {
        return JSON.parse(guardado);
      }
    }
    return null;
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }
    if (error.status === 401) return 'La contraseña es incorrecta';
    if (error.status === 404) return 'No existe un usuario o administrador con esas credenciales';
    return 'Ocurrió un error al procesar la solicitud';
  }
}