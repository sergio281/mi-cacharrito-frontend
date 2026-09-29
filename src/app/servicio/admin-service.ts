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


  private ListTodosUrl = 'http://localhost:8080/Alquileres/a/listarTodos/';
  private apiUrl = 'http://localhost:8080/Admin';

  constructor(private http: HttpClient) { }

  // --- Endpoints de la REST API (Ruta /Admin) ---


  ListarTodos(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(this.ListTodosUrl);
  }

  getDisponiblesPorTipo(tipoId: number): Observable<Vehiculo[]> {
    // Aseguramos que tipoId tenga un valor, si es undefined o null enviamos una cadena vacía o no hacemos la petición
    const tipoParam = tipoId != null ? tipoId.toString() : '';

    return this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos/disponibles`, {
      params: { tipo: tipoParam }
    });
  }

  getPendientes(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(`${this.apiUrl}/alquileres/pendientes`);
  }

  buscarPorPlaca(placa: string): Observable<Alquileres> {
    return this.http.get<Alquileres>(`${this.apiUrl}/alquileres/buscar-placa/${placa}`);
  }



}