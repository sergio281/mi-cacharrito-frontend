import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Registro } from './registro/registro';
import { Login } from './login/login';
import { UsuarioComponent } from './usuario/usuario';
import { AdminComponent } from './admin/admin';
import { Vehiculocomponent } from './vehiculo/vehiculo';
import { authGuard } from './servicio/auth-guard';
import { guestGuard } from './servicio/guest-guard';
import { ContratoComponent } from './contrato/contrato';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'registro', component: Registro, canActivate: [guestGuard] },
    { path: 'login', component: Login, canActivate: [guestGuard] },

    // Rutas protegidas por rol
    { 
      path: 'usuario', 
      component: UsuarioComponent, 
      canActivate: [authGuard(['USUARIO', 'ADMIN'])] 
    },
    { 
      path: 'contrato', 
      component: ContratoComponent,
      canActivate: [authGuard(['USUARIO', 'ADMIN'])] // 👈 Corregido el cierre de llave
    },
    { 
      path: 'admin', 
      component: AdminComponent, 
      data: { ngSkipHydration: true },
      canActivate: [authGuard(['ADMIN'])] 
    },
    { 
      path: 'vehiculos', 
      component: Vehiculocomponent, 
      canActivate: [authGuard(['USUARIO', 'ADMIN'])] 
    },

    { path: '**', redirectTo: '' }
];