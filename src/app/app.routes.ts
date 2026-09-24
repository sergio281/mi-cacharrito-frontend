import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Registro } from './registro/registro';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'registro', component: Registro }
];