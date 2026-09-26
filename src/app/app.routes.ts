import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Registro } from './registro/registro';
import { Login } from './login/login';
import { UsuarioComponent } from './usuario/usuario';
import { AdminComponent } from './admin/admin';
import { Vehiculocomponent } from './vehiculo/vehiculo';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'registro', component: Registro },
    { path: 'login', component: Login },
    { path: 'usuario', component: UsuarioComponent },
    { path: 'admin', component: AdminComponent },
    { path: 'vehiculos', component: Vehiculocomponent }
];