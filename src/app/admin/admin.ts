import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../servicio/admin-service';
import { Vehiculo } from '../entidades/vehiculo';
import { Alquileres } from '../entidades/alquileres';
import { TipoVehiculo } from '../entidades/tipo-vehiculo';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-admin',
  standalone: true,
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class AdminComponent implements OnInit {
  pestanaActiva: string = 'disponibles';

  // Lista de tipos traídos de la BD y ID seleccionado actualmente
  tiposVehiculo: TipoVehiculo[] = [];
  tipoSeleccionadoId: number = 1;

  pendientes: Alquileres[] = [];
  disponibles: Vehiculo[] = [];

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

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarTiposVehiculo();
  }

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
  }

  cargarTiposVehiculo(): void {
    this.adminService.getTiposVehiculo().subscribe({
      next: (tipos) => {
        this.tiposVehiculo = tipos;
        if (tipos.length > 0) {
          // Selecciona el primer tipo de vehículo por defecto usando su ID
          this.seleccionarTipo(tipos[0].id_Tipo_Vehiculo);
        }
      },
      error: (err) => console.error('Error al cargar tipos de vehículo:', err)
    });
  }

  cargarPendientes(): void {
    this.adminService.getPendientes().subscribe({
      next: (data) => (this.pendientes = data),
      error: (err) => console.error('Error al cargar pendientes:', err)
    });
  }

  seleccionarTipo(tipoId: number): void {
    this.tipoSeleccionadoId = tipoId;
    this.cargarDisponibles(tipoId);
  }

  cargarDisponibles(tipoId: number): void {
    this.adminService.getDisponiblesPorTipo(tipoId).subscribe({
      next: (data) => (this.disponibles = data),
      error: (err) => console.error('Error al cargar disponibles:', err)
    });
  }

  buscarPorPlaca(): void {
    if (!this.inputPlaca.trim()) return;
    this.busquedaPlacaRealizada = true;
    this.entregaConfirmada = false;

    this.adminService.buscarPorPlaca(this.inputPlaca.trim().toUpperCase()).subscribe({
      next: (data) => (this.alquilerPlacaEncontrado = data),
      error: () => (this.alquilerPlacaEncontrado = null)
    });
  }

  marcarEntregado(): void {
    if (!this.alquilerPlacaEncontrado) return;
    this.adminService.marcarComoEntregado(this.alquilerPlacaEncontrado.idAlquiler).subscribe({
      next: () => {
        this.entregaConfirmada = true;
        this.cargarPendientes();
      }
    });
  }

  buscarPorAlquiler(): void {
    if (!this.inputAlquilerId) return;
    this.busquedaAlquilerRealizada = true;
    this.liberacionConfirmada = false;
    this.fechaRealEntrega = '';
    this.diasAdicionales = 0;
    this.recargoTotal = 0;

    this.adminService.buscarPorNumero(this.inputAlquilerId).subscribe({
      next: (data) => (this.alquilerEncontrado = data),
      error: () => (this.alquilerEncontrado = null)
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

  marcarDisponible(): void {
    if (!this.alquilerEncontrado) return;

    const datosLiberacion = {
      fechaEntrega: new Date(this.fechaRealEntrega),
      valorDiasExtra: this.recargoTotal,
      valorTotal: (this.alquilerEncontrado.valorAlquiler || 0) + this.recargoTotal
    };

    this.adminService.marcarComoDisponible(this.alquilerEncontrado.idAlquiler, datosLiberacion).subscribe({
      next: () => {
        this.liberacionConfirmada = true;
        if (this.tipoSeleccionadoId !== null) {
          this.cargarDisponibles(this.tipoSeleccionadoId);
        }
      }
    });
  }




  
}