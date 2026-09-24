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

    constructor(private http: HttpClient) { }

    registrar(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(this.urlBase, usuario).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => this.obtenerMensajeError(error)))
        );
    }

    private obtenerMensajeError(error: HttpErrorResponse): string {
        if (typeof error.error === 'string' && error.error.trim().length > 0) {
            return error.error;
        }
        if (error.status === 0) {
            return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos';
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