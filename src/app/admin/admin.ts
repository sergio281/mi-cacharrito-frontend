import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Navegación de pestañas
  pestanaActiva: string = 'disponibles';

  // Gestión de tipos y vehículos disponibles
  tiposVehiculo: TipoVehiculo[] = [];
  tipoSeleccionadoId: number = 1;
  disponibles: Vehiculo[] = [];

  // Alquileres pendientes y búsquedas por cliente
  pendientes: Alquileres[] = [];
  clienteIdBuscar: string = '';
  alquileres: Alquileres[] = [];

  // Búsqueda por placa y entrega
  inputPlaca: string = '';
  placaBuscar: string = '';
  alquilerPlacaEncontrado: Alquileres | null = null;
  resultadoPlaca: any = null;
  busquedaPlacaRealizada: boolean = false;
  entregaConfirmada: boolean = false;
  sinResultadoPlaca: boolean = false;

  // Búsqueda por número de alquiler y devolución/liberación
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarTiposVehiculo();
  }

  // --- NAVEGACIÓN Y PESTAÑAS ---
  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
  }

  activarPestana(nombre: string): void {
    this.pestanaActiva = nombre;
  }

  // --- CARGA DE DATOS INICIALES ---
  cargarTiposVehiculo(): void {
    this.adminService.getTiposVehiculo().subscribe({
      next: (tipos: TipoVehiculo[]) => {
        this.tiposVehiculo = tipos;
        if (tipos && tipos.length > 0) {
          this.seleccionarTipo(tipos[0].id_Tipo_Vehiculo);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar tipos de vehículo:', err)
    });
  }

  cargarPendientes(): void {
    this.adminService.getPendientes().subscribe({
      next: (data: Alquileres[]) => {
        this.pendientes = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar pendientes:', err)
    });
  }

  seleccionarTipo(tipoId: number): void {
    this.tipoSeleccionadoId = tipoId;
    this.cargarDisponibles(tipoId);
  }

  cargarDisponibles(tipoId: number): void {
    this.adminService.getDisponiblesPorTipo(tipoId).subscribe({
      next: (data: Vehiculo[]) => {
        this.disponibles = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar disponibles:', err);
        this.disponibles = [];
      }
    });
  }

  // --- BÚSQUEDAS ---
  buscarAlquileres(): void {
    if (!this.clienteIdBuscar) return;

    this.adminService.buscarAlquileresPorId(this.clienteIdBuscar).subscribe({
      next: (dato: Alquileres[]) => {
        this.alquileres = dato;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al buscar los alquileres:', error);
        alert('No se encontraron alquileres para ese ID.');
        this.alquileres = [];
      }
    });
  }

  buscarPorPlaca(): void {
    const placa = this.inputPlaca.trim() || this.placaBuscar.trim();
    if (!placa) return;

    this.busquedaPlacaRealizada = true;
    this.entregaConfirmada = false;
    this.sinResultadoPlaca = false;

    this.adminService.buscarPorPlaca(placa.toUpperCase()).subscribe({
      next: (data: Alquileres) => {
        if (data) {
          this.alquilerPlacaEncontrado = data;
          this.resultadoPlaca = data;
        } else {
          this.alquilerPlacaEncontrado = null;
          this.resultadoPlaca = null;
          this.sinResultadoPlaca = true;
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al buscar por placa:', error);
        this.alquilerPlacaEncontrado = null;
        this.resultadoPlaca = null;
        this.sinResultadoPlaca = true;
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
      next: (data: Alquileres) => {
        this.alquilerEncontrado = data;
        this.cdr.detectChanges();
      },
      error: () => (this.alquilerEncontrado = null)
    });
  }

  // --- ACCIONES Y OPERACIONES ---
  marcarEntregado(): void {
    const id = this.alquilerPlacaEncontrado?.idAlquiler || this.resultadoPlaca?.idAlquiler;
    if (!id) return;

    this.adminService.marcarComoEntregado(id).subscribe({
      next: () => {
        this.entregaConfirmada = true;
        this.cargarPendientes();
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al marcar disponible:', err)
    });
  }

  // --- FORMATOS Y UTILIDADES ---
  formatoFecha(iso: string): string {
    if (!iso) return '';
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatoDinero(n: number): string {
    return '$' + (n || 0).toLocaleString('es-CO');
  }
}