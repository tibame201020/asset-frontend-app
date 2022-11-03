import { Routes } from '@angular/router';
import { DepositComponent } from './deposit/deposit.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    { path: '', redirectTo: 'deposit', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'deposit', component: DepositComponent },
];

export const DepositRouter = routes;