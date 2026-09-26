import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../servicio/auth-service';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navegacion.html',
  styleUrls: ['./navegacion.css']
})
export class Navegacion {

constructor(public authService: AuthService, private router: Router) { }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}