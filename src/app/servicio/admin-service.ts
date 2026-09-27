import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AdminService {
    constructor(private httpClient: HttpClient) { }

    private buscarAlquileresPorIdUrl = 'http://localhost:8080/Alquileres/a/buscarAlquileres/'
    private listarTiposUrl = 'http://localhost:8080/Vehiculos/v/listarTipos/'
    private buscarDisponiblesUrl = 'http://localhost:8080/Vehiculos/v/buscarDisponibles/'
    private buscarPorPlacaUrl = 'http://localhost:8080/Alquileres/a/buscarPorPlaca/'
    private marcarEntregadoUrl = 'http://localhost:8080/Alquileres/a/marcarEntregado/'

    buscarPorPlaca(placa: string): Observable<any> {
        return this.httpClient.get<any>(this.buscarPorPlacaUrl, {
            params: { placa: placa }
        });
    }

    marcarEntregado(id: number): Observable<any> {
        return this.httpClient.get(this.marcarEntregadoUrl, {
            params: { id: id },
            responseType: 'text'
        });
    }

    listarTipos(): Observable<any> {
        return this.httpClient.get<any>(this.listarTiposUrl);
    }

    buscarDisponiblesPorTipo(id: number): Observable<any> {
        return this.httpClient.get<any>(this.buscarDisponiblesUrl, {
            params: { id: id }
        });
    }

    buscarAlquileresPorId(id: string): Observable<any> {
        return this.httpClient.get<any>(this.buscarAlquileresPorIdUrl, {
            params: { id: id }
        });
    }
}