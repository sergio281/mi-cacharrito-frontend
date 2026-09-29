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
  tiposVehiculo: TipoVehiculo[] = [];
  tipoSeleccionadoId: number | null = null;
  disponibles: Vehiculo[] = [];
  todosAlquileres: Alquileres[] = [];
  pendientes: Alquileres[] = [];
  inputPlaca: string = '';
  alquilerPlacaEncontrado: Alquileres | null = null;
  busquedaPlacaRealizada: boolean = false;
  entregaConfirmada: boolean = false;


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
    else if (pestana === 'pendientes') {
      this.cargarPendientes();
    } else if (pestana === 'disponibles' && this.tipoSeleccionadoId !== null) {
      this.cargarDisponibles(this.tipoSeleccionadoId);
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

  cargarDisponibles(tipoId: number): void {
    if (tipoId == null) return;

    this.adminService.getDisponiblesPorTipo(tipoId).subscribe({
      next: (data: any[]) => {
        // ngZone obliga a Angular a registrar el cambio al refrescar con F5
        this.zone.run(() => {
          if (Array.isArray(data)) {
            this.disponibles = data.map(v => {
              const tv = v?.tipoVehiculo || v?.tipovehiculo || {};
              return {
                ...v,
                Placa: v?.Placa ?? v?.placa ?? v?.Id_vehiculo ?? '',
                Marca: v?.Marca ?? v?.marca ?? tv?.tipo_Vehiculo ?? tv?.tipoVehiculo ?? '',
                Modelo: v?.Modelo ?? v?.modelo ?? '',
                Color: v?.Color ?? v?.color ?? '',
                PrecioDia: v?.PrecioDia ?? v?.precioDia ?? v?.precio_dia ?? 0,
                Estado: v?.Estado ?? v?.estado ?? 'Disponible'
              };
            });
          } else {
            this.disponibles = [];
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar disponibles:', err);
        this.disponibles = [];
        this.cdr.detectChanges();
      }
    });
  }

  cargarPendientes(): void {
    this.adminService.getPendientes().subscribe({
      next: (data: Alquileres[]) => {
        this.zone.run(() => {
          this.pendientes = [...data];
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error al cargar pendientes:', err)
    });
  }

  buscarPorPlaca(valorInput?: string): void {
    const texto = valorInput || this.inputPlaca || '';
    const placa = texto.trim().toUpperCase();

    if (!placa) return;

    this.busquedaPlacaRealizada = false;
    this.entregaConfirmada = false;
    this.alquilerPlacaEncontrado = null;

    this.adminService.buscarPorPlaca(placa).subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          this.busquedaPlacaRealizada = true;
          if (data) {
            const vehiculoRaw = data.vehiculo || {};
            const tipoRaw = vehiculoRaw.tipoVehiculo || vehiculoRaw.tipovehiculo || {};

            this.alquilerPlacaEncontrado = {
              ...data,
              idAlquiler: data.idAlquiler ?? data.id_alquiler,
              vehiculo: {
                ...vehiculoRaw,
                Placa: vehiculoRaw.Placa ?? vehiculoRaw.placa,
                Marca: vehiculoRaw.Marca ?? vehiculoRaw.marca,
                tipoVehiculo: {
                  id_Tipo_Vehiculo: tipoRaw.id_Tipo_Vehiculo ?? tipoRaw.idTipoVehiculo,
                  tipo_Vehiculo: tipoRaw.tipo_Vehiculo ?? tipoRaw.tipoVehiculo,
                  descripcion: tipoRaw.descripcion ?? ''
                }
              }
            };
          } else {
            this.alquilerPlacaEncontrado = null;
          }
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => {
        console.error('Error al buscar por placa:', error);
        this.busquedaPlacaRealizada = true;
        this.alquilerPlacaEncontrado = null;
        this.cdr.detectChanges();
      }
    });
  }

}