import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../entidades/vehiculo';
import { Alquileres } from '../entidades/alquileres';
import { TipoVehiculo } from '../entidades/tipo-vehiculo';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8080/Admin';

  constructor(private http: HttpClient) {}

  // Obtener la lista de tipos de vehículo registrados en BD
  getTiposVehiculo(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.apiUrl}/tipos-vehiculo`);
  }

  getPendientes(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(`${this.apiUrl}/alquileres/pendientes`);
  }

  // Pasa el ID numérico del tipo
  getDisponiblesPorTipo(tipoId: number): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos/disponibles`, { params: { tipo: tipoId } });
  }

  buscarPorPlaca(placa: string): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.apiUrl}/alquileres/buscar-placa/${placa}`);
  }

  marcarComoEntregado(idAlquiler: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alquileres/${idAlquiler}/entregar`, {});
  }

  buscarPorNumero(idAlquiler: number): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.apiUrl}/alquileres/${idAlquiler}`);
  }

  marcarComoDisponible(idAlquiler: number, datosLiberacion: { fechaEntrega: Date; valorDiasExtra: number; valorTotal: number }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alquileres/${idAlquiler}/liberar`, datosLiberacion);
  }
}