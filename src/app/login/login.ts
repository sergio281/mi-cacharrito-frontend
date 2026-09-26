import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../servicio/auth-service';
import { Usuario } from '../entidades/usuario';
import { Admin } from '../entidades/admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  formulario: FormGroup;
  enviando = signal(false);
  errorGeneral = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // <-- Inyectamos el servicio de autenticación
    private router: Router
  ) {
    this.formulario = this.fb.group({
      documento: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  enviar(): void {
    this.errorGeneral.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    const credenciales = {
      documento: this.formulario.value.documento,
      password: this.formulario.value.password
    };

    this.authService.autenticar(credenciales).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);

        if (respuesta && respuesta.rol === 'ADMIN') {
          this.procesarInicioAdmin(respuesta as Admin);
        } else {
          this.procesarInicioUsuario(respuesta as Usuario);
        }
      },
      error: (mensaje: string) => {
        this.enviando.set(false);
        this.errorGeneral.set(mensaje);
      }
    });
  }

  private procesarInicioAdmin(admin: Admin): void {
    this.authService.guardarSesion(admin);
    this.router.navigate(['/admin']);
  }

  private procesarInicioUsuario(usuario: Usuario): void {
    this.authService.guardarSesion(usuario);
    this.router.navigate(['/usuario']);
  }


  campoInvalido(nombre: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  tieneError(nombre: string, tipo: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.hasError(tipo) && (campo.touched || campo.dirty);
  }
}