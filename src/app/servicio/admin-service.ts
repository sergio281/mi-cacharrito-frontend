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

  private Adminurl = 'http://localhost:8080/Admin';

  constructor(private http: HttpClient) { }

  ListarTodos(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(`${this.Adminurl}/alquileres/todos`);
  }

  getPendientes(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(`${this.Adminurl}/alquileres/pendientes`);
  }

  buscarPorNumero(idAlquiler: number): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.Adminurl}/alquileres/${idAlquiler}`);
  }

  buscarPorPlaca(placa: string): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.Adminurl}/alquileres/buscar-placa/${placa}`);
  }

  marcarComoEntregado(idAlquiler: number): Observable<void> {
    return this.http.put<void>(`${this.Adminurl}/alquileres/${idAlquiler}/entregar`, {});
  }

  marcarComoDisponible(idAlquiler: number, datosLiberacion: { fechaEntrega: Date; valorDiasExtra: number; valorTotal: number }): Observable<void> {
    return this.http.put<void>(`${this.Adminurl}/alquileres/${idAlquiler}/liberar`, datosLiberacion);
  }

  getTiposVehiculo(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.Adminurl}/tipos-vehiculo`);
  }

  getDisponiblesPorTipo(tipoId: number): Observable<Vehiculo[]> {
    const tipoParam = tipoId != null ? tipoId.toString() : '';
    return this.http.get<Vehiculo[]>(`${this.Adminurl}/vehiculos/disponibles`, {
      params: { tipo: tipoParam }
    });
  }

  registrarVehiculo(datosVehiculo: any): Observable<any> {
    return this.http.post(`${this.Adminurl}/vehiculos/registrar`, datosVehiculo);
  }
}