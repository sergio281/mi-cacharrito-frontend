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
  private buscarAlquileresPorIdUrl = 'http://localhost:8080/Alquileres/a/buscarAlquileres/';
  private listarTiposUrl = 'http://localhost:8080/Vehiculos/v/listarTipos/';
  private buscarDisponiblesUrl = 'http://localhost:8080/Vehiculos/v/buscarDisponibles/';
  private marcarEntregadoUrl = 'http://localhost:8080/Alquileres/a/marcarEntregado/';
  private ListTodosUrl = 'http://localhost:8080/Alquileres/a/listarTodos/';

  constructor(private http: HttpClient) { }

  // --- Endpoints de la REST API (Ruta /Admin) ---

  getTiposVehiculo(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.apiUrl}/tipos-vehiculo`);
  }

  ListarTodos(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(this.ListTodosUrl);
  }

  getPendientes(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(`${this.apiUrl}/alquileres/pendientes`);
  }

  getDisponiblesPorTipo(tipoId: number): Observable<Vehiculo[]> {
    // Aseguramos que tipoId tenga un valor, si es undefined o null enviamos una cadena vacía o no hacemos la petición
    const tipoParam = tipoId != null ? tipoId.toString() : '';

    return this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos/disponibles`, {
      params: { tipo: tipoParam }
    });
  }

  buscarPorNumero(idAlquiler: number): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.apiUrl}/alquileres/${idAlquiler}`);
  }

  marcarComoEntregado(idAlquiler: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alquileres/${idAlquiler}/entregar`, {});
  }

  marcarComoDisponible(idAlquiler: number, datosLiberacion: { fechaEntrega: Date; valorDiasExtra: number; valorTotal: number }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/alquileres/${idAlquiler}/liberar`, datosLiberacion);
  }

  // --- Métodos de endpoints alternativos o Legacy ---

  buscarPorPlaca(placa: string): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.apiUrl}/alquileres/buscar-placa/${placa}`);
  }

  buscarAlquileresPorId(id: string | number): Observable<any> {
    return this.http.get<any>(this.buscarAlquileresPorIdUrl, {
      params: { id: id.toString() }
    });
  }

  listarTipos(): Observable<any> {
    return this.http.get<any>(this.listarTiposUrl);
  }

  buscarDisponiblesPorTipo(id: number): Observable<any> {
    const idParam = id != null ? id.toString() : '';

    return this.http.get<any>(this.buscarDisponiblesUrl, {
      params: { id: id.toString() }
    });
  }

  marcarEntregado(id: number): Observable<string> {
    return this.http.get(this.marcarEntregadoUrl, {
      params: { id: id.toString() },
      responseType: 'text'
    });
  }
}