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

  constructor(private http: HttpClient) { }

  // --- Endpoints de la REST API (Ruta /Admin) ---


  ListarTodos(): Observable<Alquileres[]> {
    return this.http.get<Alquileres[]>(this.ListTodosUrl);
  }



}