import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../entidades/usuario';
import { Admin } from '../entidades/admin';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private urlBase = 'http://localhost:8080/RegistrioUsuarios';
  private urlLogin = 'http://localhost:8080/IniciarSesion';

  // Permite guardar un Usuario o un Admin en la sesión activa sin alterar sus clases
  sesion$ = new BehaviorSubject<Usuario | Admin | any | null>(this.leerSesionGuardada());

  constructor(private http: HttpClient) { }

  registrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.urlBase, usuario).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
    );
  }

  // Realiza la autenticación enviando las credenciales ingresadas en el formulario
  iniciarSesion(credenciales: { documento: string; password: string }): Observable<any> {
    return this.http.post<any>(this.urlLogin, credenciales).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
    );
  }

  // Guardar la sesión independiente según corresponda
  guardarSesion(datosSesion: Usuario | Admin): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('usuario', JSON.stringify(datosSesion));
    }
    this.sesion$.next(datosSesion);
  }

  obtenerUsuarioActual(): Usuario | Admin | null {
    return this.sesion$.value;
  }

  cerrarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('usuario');
    }
    this.sesion$.next(null);
  }

  private leerSesionGuardada(): Usuario | Admin | null {
    if (typeof sessionStorage !== 'undefined') {
      const guardado = sessionStorage.getItem('usuario');
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
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos';
    }
    if (error.status === 401) {
      return 'La contraseña es incorrecta';
    }
    if (error.status === 404) {
      return 'No existe un usuario o administrador con esas credenciales';
    }
    if (error.status === 409) {
      return 'Ya existe una cuenta con ese documento o correo electrónico';
    }
    if (error.status === 400) {
      return 'Revisa los datos del formulario, alguno no es válido';
    }
    return 'Ocurrió un error inesperado. Intenta de nuevo más tarde';
  }
}