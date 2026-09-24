import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../entidades/usuario';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private urlBase = 'http://localhost:8080/RegistrioUsuarios';
    private urlLogin = 'http://localhost:8080/IniciarSesion';
    private usuarioActual: Usuario | null = null;

    constructor(private http: HttpClient) { }

    registrar(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(this.urlBase, usuario).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
        );
    }

    iniciarSesion(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(this.urlLogin, usuario).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
        );
    }

    guardarSesion(usuario: Usuario): void {
        this.usuarioActual = usuario;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('usuario', JSON.stringify(usuario));
        }
    }

    obtenerUsuarioActual(): Usuario | null {
        if (!this.usuarioActual && typeof sessionStorage !== 'undefined') {
            const guardado = sessionStorage.getItem('usuario');
            if (guardado) {
                this.usuarioActual = JSON.parse(guardado);
            }
        }
        return this.usuarioActual;
    }

    cerrarSesion(): void {
        this.usuarioActual = null;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('usuario');
        }
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
            return 'No existe un usuario con ese documento';
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