export class Usuario {
  idUsuario?: number;
  documento: string = '';
  nombres: string = '';
  apellidos: string = '';
  correo: string = '';
  telefono: string = '';
  password: string = '';
  fechaExpedicionLicencia: string = '';
  fechaVencimientoLicencia: string = '';
  categoriaLicencia: string = '';
  rol: string = 'USUARIO';
}