import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../servicio/admin-service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class AdminComponent {
  pestanaActiva: string = 'seccion1';
  clienteIdBuscar: string = '';
  alquileres: any[] = [];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) { }

  tipos: any[] = [];
  tipoActivo: any = null;
  disponibles: any[] = [];
  placaBuscar: string = '';
  resultadoPlaca: any = null;
  entregaConfirmada: boolean = false;
  sinResultadoPlaca: boolean = false;

  ngOnInit(): void {
    this.adminService.listarTipos().subscribe({
      next: (dato) => {
        this.tipos = dato;
        if (this.tipos.length > 0) {
          this.filtrarPorTipo(this.tipos[0]);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al listar tipos:', error);
      }
    });
  }

  filtrarPorTipo(tipo: any): void {
    this.tipoActivo = tipo;
    this.adminService.buscarDisponiblesPorTipo(tipo.Id_Tipo_Vehiculo).subscribe({
      next: (dato) => {
        this.disponibles = dato;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al filtrar vehículos:', error);
        this.disponibles = [];
      }
    });
  }

  buscarPorPlaca(): void {
    this.entregaConfirmada = false;
    this.sinResultadoPlaca = false;
    this.adminService.buscarPorPlaca(this.placaBuscar).subscribe({
      next: (dato) => {
        if (dato) {
          this.resultadoPlaca = dato;
        } else {
          this.resultadoPlaca = null;
          this.sinResultadoPlaca = true;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por placa:', error);
        this.resultadoPlaca = null;
        this.sinResultadoPlaca = true;
      }
    });
  }

  marcarEntregado(): void {
    this.adminService.marcarEntregado(this.resultadoPlaca.idAlquiler).subscribe({
      next: () => {
        this.entregaConfirmada = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al marcar entregado:', error);
      }
    });
  }

  activarPestana(nombre: string): void {
    this.pestanaActiva = nombre;
  }

  buscarAlquileres(): void {
    this.adminService.buscarAlquileresPorId(this.clienteIdBuscar).subscribe({
      next: (dato) => {
        this.alquileres = dato;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar los alquileres:', error);
        alert("No se encontraron alquileres para ese id.");
        this.alquileres = [];
      }
    });
  }

  formatoFecha(iso: string): string {
    return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  }

  formatoDinero(n: number): string {
    return "$" + n.toLocaleString("es-CO");
  }
}