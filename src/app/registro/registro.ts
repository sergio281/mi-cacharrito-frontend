import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UsuarioService } from '../servicio/usuario';
import { Usuario } from '../entidades/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {

  formulario: FormGroup;
  enviando = signal(false);
  registroExitoso = signal(false);
  errorGeneral = signal('');

  nombresCampos: { [clave: string]: string } = {
    documento: 'documento',
    nombres: 'nombres',
    apellidos: 'apellidos',
    correo: 'correo',
    telefono: 'teléfono',
    password: 'contraseña'
  };

  constructor(private fb: FormBuilder, private servicioUsuario: UsuarioService) {
    this.formulario = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      fechaExpedicionLicencia: [''],
      fechaVencimientoLicencia: [''],
      categoriaLicencia: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.validarFechas });
  }

  // Revisa que la fecha de vencimiento sea posterior a la de expedición
  validarFechas(grupo: AbstractControl): ValidationErrors | null {
    const expedicion = grupo.get('fechaExpedicionLicencia')?.value;
    const vencimiento = grupo.get('fechaVencimientoLicencia')?.value;

    if (expedicion && vencimiento && vencimiento <= expedicion) {
      return { fechasInvalidas: true };
    }
    return null;
  }

  campoInvalido(nombre: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  tieneError(nombre: string, tipo: string): boolean {
    const campo = this.formulario.get(nombre);
    return !!campo && campo.hasError(tipo) && (campo.touched || campo.dirty);
  }

  fechasInvalidas(): boolean {
    const vencimiento = this.formulario.get('fechaVencimientoLicencia');
    return this.formulario.hasError('fechasInvalidas') && !!vencimiento && (vencimiento.touched || vencimiento.dirty);
  }

  // Arma la lista de campos que tienen error
  camposConError(): string {
    const lista: string[] = [];

    for (const nombre in this.nombresCampos) {
      if (this.formulario.get(nombre)?.invalid) {
        lista.push(this.nombresCampos[nombre]);
      }
    }

    if (this.formulario.hasError('fechasInvalidas')) {
      lista.push('fechas de la licencia');
    }

    return lista.join(', ');
  }

  enviar(): void {
    this.errorGeneral.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.errorGeneral.set('Revisa estos campos: ' + this.camposConError());
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.enviando.set(true);
    const valores = this.formulario.value;

    const usuario = new Usuario();
    usuario.documento = valores.documento;
    usuario.nombres = valores.nombres;
    usuario.apellidos = valores.apellidos;
    usuario.correo = valores.correo;
    usuario.telefono = valores.telefono;
    usuario.fechaExpedicionLicencia = valores.fechaExpedicionLicencia;
    usuario.fechaVencimientoLicencia = valores.fechaVencimientoLicencia;
    usuario.categoriaLicencia = valores.categoriaLicencia;
    usuario.password = valores.password;

    this.servicioUsuario.registrar(usuario).subscribe({
      next: () => {
        this.enviando.set(false);
        this.registroExitoso.set(true);
        this.formulario.reset();
      },
      error: (mensaje: string) => {
        this.enviando.set(false);
        this.errorGeneral.set(mensaje);

        if (mensaje.includes('documento')) {
          this.formulario.get('documento')?.setErrors({ repetido: true });
          this.formulario.get('documento')?.markAsTouched();
        }
        if (mensaje.includes('correo')) {
          this.formulario.get('correo')?.setErrors({ repetido: true });
          this.formulario.get('correo')?.markAsTouched();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}