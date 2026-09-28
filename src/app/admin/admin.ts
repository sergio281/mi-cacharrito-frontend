import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../servicio/admin-service';
import { Vehiculo } from '../entidades/vehiculo';
import { Alquileres } from '../entidades/alquileres';
import { TipoVehiculo } from '../entidades/tipo-vehiculo';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  host: {
    'ngSkipHydration': 'true'
  }
})
export class AdminComponent implements OnInit {

  pestanaActiva: string = 'disponibles';
  todosAlquileres: Alquileres[] = [];


  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

  }

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;

    if (pestana === 'todos') {
      this.cargarTodos();
    }
  }

  cargarTodos(): void {
    this.adminService.ListarTodos().subscribe({
      next: (data: Alquileres[]) => {
        this.zone.run(() => {
          this.todosAlquileres = [...data];
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error al cargar todos:', err)
    });
  }


}