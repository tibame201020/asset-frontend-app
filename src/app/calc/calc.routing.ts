import { Routes } from '@angular/router';
import { ConfigComponent } from './config/config.component';

const routes: Routes = [
    { path: '', redirectTo: 'config', pathMatch: 'full' },
    {path:'config', component:ConfigComponent}
];

export const CalcRouter = routes;