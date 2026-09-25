import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UsuarioService } from '../servicio/usuario';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navegacion.html',
  styleUrls: ['./navegacion.css']
})
export class Navegacion {

  constructor(public servicioUsuario: UsuarioService, private router: Router) { }

  cerrarSesion(): void {
    this.servicioUsuario.cerrarSesion();
    this.router.navigate(['/']);
  }
}