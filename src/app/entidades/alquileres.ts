import { Usuario } from "./usuario";
import { Vehiculo } from "./vehiculo";

export class Alquileres {
    idAlquiler:number;
    usuario:Usuario;
    vehiculo:Vehiculo;
    fechaInicio:Date;
    fechaEntregaEsperada:Date;
    valorAlquiler:number;
    estado:string;
    fechaEntrega:Date;
    valorDiasExtra:number;
    valorTotal:number;

}
