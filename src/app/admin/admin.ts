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

  pendientes: Alquileres[] = [];
  todosAlquileres: Alquileres[] = [];

  inputPlaca: string = '';
  alquilerPlacaEncontrado: Alquileres | null = null;
  busquedaPlacaRealizada: boolean = false;
  entregaConfirmada: boolean = false;

  inputAlquilerId: number | null = null;
  alquilerEncontrado: Alquileres | null = null;
  busquedaAlquilerRealizada: boolean = false;
  fechaRealEntrega: string = '';
  diasAdicionales: number = 0;
  recargoTotal: number = 0;
  liberacionConfirmada: boolean = false;

  readonly VALOR_RECARGO_DIA = 60000;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone // Inyectamos NgZone
  ) { }

  ngOnInit(): void {
    this.cargarTiposVehiculo();
  }

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;

    if (pestana === 'todos') {
      this.cargarTodos();
    } else if (pestana === 'pendientes') {
      this.cargarPendientes();
    } else if (pestana === 'disponibles' && this.tipoSeleccionadoId !== null) {
      this.cargarDisponibles(this.tipoSeleccionadoId);
    }
  }

  cargarTiposVehiculo(): void {
    this.adminService.getTiposVehiculo().subscribe({
      next: (tipos: any[]) => {
        this.zone.run(() => {
          this.tiposVehiculo = tipos.map(t => ({
            ...t,
            id_Tipo_Vehiculo: t?.id_Tipo_Vehiculo ?? t?.Id_Tipo_Vehiculo ?? t?.id,
            tipo_Vehiculo: t?.tipo_Vehiculo ?? t?.Tipo_Vehiculo ?? t?.nombre ?? 'Sin nombre'
          }));

          if (this.tiposVehiculo.length > 0) {
            const primerTipoId = this.tiposVehiculo[0].id_Tipo_Vehiculo;
            if (primerTipoId != null) {
              this.tipoSeleccionadoId = primerTipoId;
              if (this.pestanaActiva === 'disponibles') {
                this.cargarDisponibles(primerTipoId);
              }
            }
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar tipos:', err);
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarTipo(tipoId: number): void {
    if (tipoId == null) return;
    this.tipoSeleccionadoId = tipoId;
    this.cargarDisponibles(tipoId);
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


  marcarEntregado(): void {
    const id = this.alquilerPlacaEncontrado?.idAlquiler;
    if (!id) return;

    this.adminService.marcarComoEntregado(id).subscribe({
      next: () => {
        this.zone.run(() => {
          this.entregaConfirmada = true;
          this.alquilerPlacaEncontrado = null;
          this.cargarPendientes();
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => console.error('Error al marcar como entregado:', error)
    });
  }

  calcularRecargo(): void {
    if (!this.alquilerEncontrado || !this.fechaRealEntrega) return;

    const pactada = new Date(this.alquilerEncontrado.fechaEntregaEsperada);
    const real = new Date(this.fechaRealEntrega + 'T00:00:00');
    const diferenciaMs = real.getTime() - pactada.getTime();

    this.diasAdicionales = Math.max(0, Math.round(diferenciaMs / (1000 * 60 * 60 * 24)));
    this.recargoTotal = this.diasAdicionales * this.VALOR_RECARGO_DIA;
  }


}