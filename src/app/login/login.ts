import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../servicio/usuario';
import { Usuario } from '../entidades/usuario';

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

  constructor(private fb: FormBuilder, private servicioUsuario: UsuarioService, private router: Router) {
    this.formulario = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required]
    });
  }

  campoInvalido(nombre: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  tieneError(nombre: string, tipo: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.hasError(tipo) && (campo.touched || campo.dirty);
  }

  enviar(): void {
    this.errorGeneral.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    const usuario = new Usuario();
    usuario.documento = this.formulario.value.documento;
    usuario.password = this.formulario.value.password;

    this.servicioUsuario.iniciarSesion(usuario).subscribe({
      next: (usuarioEncontrado) => {
        this.enviando.set(false);
        this.servicioUsuario.guardarSesion(usuarioEncontrado);
        this.router.navigate(['/usuario']);
      },
      error: (mensaje: string) => {
        this.enviando.set(false);
        this.errorGeneral.set(mensaje);
      }
    });
  }
}