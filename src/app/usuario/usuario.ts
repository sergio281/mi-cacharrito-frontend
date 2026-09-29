import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../servicio/admin-service';
import { UsuarioService } from '../servicio/usuario';
import { Vehiculo } from '../entidades/vehiculo';
import { TipoVehiculo } from '../entidades/tipo-vehiculo';
import { Alquileres } from '../entidades/alquileres';
import { Usuario } from '../entidades/usuario';
import { AuthService } from '../servicio/auth-service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class UsuarioComponent implements OnInit {


  pestanaActiva: string = 'alquilar';


  usuarioActual: Usuario | null = null;
  inicialesUsuario: string = '';

  tiposVehiculo: TipoVehiculo[] = [];
  tipoSeleccionadoId: number | null = null;
  vehiculosDisponibles: Vehiculo[] = [];
  misAlquileres: Alquileres[] = [];

  vehiculoParaAlquilar: Vehiculo | null = null;
  fechaInicio: string = '';
  fechaEntrega: string = '';

  constructor(
    private adminService: AdminService,
    private usuarioService: UsuarioService,
    private router: Router,
    private authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarTiposVehiculo();
    this.cargarMisAlquileres();
  }

  cargarDatosUsuario(): void {
  // Usamos el método correcto de AuthService
  this.usuarioActual = this.authService.obtenerSesionActual() as Usuario;

  // Respaldo por si se recargó la página y el BehaviorSubject aún no actualizó
  if (!this.usuarioActual && typeof sessionStorage !== 'undefined') {
    const guardado = sessionStorage.getItem('usuario');
    if (guardado) {
      this.usuarioActual = JSON.parse(guardado);
    }
  }

  console.log('Usuario en sesión:', this.usuarioActual);

  if (this.usuarioActual) {
    const nombre = this.usuarioActual.nombres || '';
    const apellido = this.usuarioActual.apellidos || '';
    this.inicialesUsuario = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
}

  cargarTiposVehiculo(): void {
    this.adminService.getTiposVehiculo().subscribe({
      next: (tipos: any[]) => {
        this.zone.run(() => {
          this.tiposVehiculo = tipos.map(t => ({
            ...t,
            id_Tipo_Vehiculo: t.id_Tipo_Vehiculo || t.Id_Tipo_Vehiculo,
            tipo_Vehiculo: t.tipo_Vehiculo || t.Tipo_Vehiculo || t.Descripcion || t.descripcion
          }));

          console.log('Tipos mapeados correctamente:', this.tiposVehiculo);

          if (this.tiposVehiculo && this.tiposVehiculo.length > 0) {
            const primerId = this.tiposVehiculo[0].id_Tipo_Vehiculo;
            if (primerId) {
              this.seleccionarTipo(primerId);
            }
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error al cargar tipos de vehículo:', err)
    });
  }

  seleccionarTipo(tipoId: number): void {
    if (!tipoId || tipoId <= 0) {
      return;
    }

    this.tipoSeleccionadoId = tipoId;

    this.adminService.getDisponiblesPorTipo(tipoId).subscribe({
      next: (vehiculos) => {
        this.zone.run(() => {
          this.vehiculosDisponibles = [...vehiculos];
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al obtener vehículos:', err);
      }
    });
  }

  cargarMisAlquileres(): void {
    this.adminService.ListarTodos().subscribe({
      next: (alquileres) => {
        this.zone.run(() => {
          this.misAlquileres = [...alquileres];
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error al obtener alquileres:', err)
    });
  }

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
  }

  abrirModalAlquilar(vehiculo: any): void {
  this.vehiculoParaAlquilar = vehiculo;
  
  // Establecer fecha por defecto (Hoy) en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];
  this.fechaInicio = hoy;
  this.fechaEntrega = hoy;
}

confirmarAlquiler(): void {
  // 1. Validar que las fechas no estén vacías
  if (!this.fechaInicio || !this.fechaEntrega || this.fechaInicio.trim() === '' || this.fechaEntrega.trim() === '') {
    alert('Por favor selecciona la fecha de inicio y la fecha de entrega.');
    return;
  }

  if (!this.vehiculoParaAlquilar) {
    alert('No se ha seleccionado ningún vehículo.');
    return;
  }

  if (!this.usuarioActual) {
    this.cargarDatosUsuario();
  }

  const u = this.usuarioActual as any;
  const idUsuarioActual = u?.idUsuario || u?.id_usuario || u?.id;

  if (!idUsuarioActual) {
    alert('No se pudo identificar la sesión del usuario actual.');
    return;
  }

  const inicio = new Date(this.fechaInicio);
  const entrega = new Date(this.fechaEntrega);

  if (isNaN(inicio.getTime()) || isNaN(entrega.getTime())) {
    alert('Las fechas ingresadas no son válidas.');
    return;
  }

  const diferenciaMilisegundos = entrega.getTime() - inicio.getTime();
  const dias = Math.ceil(diferenciaMilisegundos / (1000 * 3600 * 24));

  if (dias <= 0) {
    alert('La fecha de entrega debe ser posterior a la fecha de inicio.');
    return;
  }

  const precioPorDia = this.vehiculoParaAlquilar.PrecioDia || (this.vehiculoParaAlquilar as any).preciodia || 0; 
  const totalCalculado = dias * precioPorDia;

  const idVehiculoSeleccionado = Number(
    this.vehiculoParaAlquilar.Id_vehiculo || 
    (this.vehiculoParaAlquilar as any).id_vehiculo || 
    (this.vehiculoParaAlquilar as any).idVehiculo
  );

  const nuevoAlquiler = {
    usuario: {
      idUsuario: Number(idUsuarioActual)
    },
    vehiculo: {
      id_vehiculo: idVehiculoSeleccionado
    },
    fechaInicio: this.fechaInicio,             // Formato 'YYYY-MM-DD'
    fechaEntregaEsperada: this.fechaEntrega,   // Formato 'YYYY-MM-DD'
    valorAlquiler: totalCalculado,
    valorTotal: totalCalculado,
    valorDiasExtra: 0,
    estado: 'PENDIENTE'
  };

  console.log('Objeto enviado al backend:', nuevoAlquiler);

  this.usuarioService.guardarAlquiler(nuevoAlquiler).subscribe({
    next: (res) => {
      this.cargarMisAlquileres();
      this.router.navigate(['/contrato'], {
        queryParams: {
          vehiculoId: idVehiculoSeleccionado,
          fechaInicio: this.fechaInicio,
          fechaEntrega: this.fechaEntrega,
          total: totalCalculado
        }
      });
    },
    error: (err) => {
      console.error('Error al registrar el alquiler:', err);
      alert('Error al registrar el alquiler. Verifica las fechas e intenta nuevamente.');
    }
  });
}

  cancelarAlquiler(alquiler: Alquileres): void {
    if (confirm('¿Estás seguro de cancelar este alquiler?')) {
      alquiler.estado = 'CANCELADO';
    }
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  get alquileresPendientesCount(): number {
    return this.misAlquileres.filter(a => a.estado === 'PENDIENTE').length;
  }
}