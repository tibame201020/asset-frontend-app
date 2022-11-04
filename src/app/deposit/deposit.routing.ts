import { Routes } from '@angular/router';
import { DepositComponent } from './deposit/deposit.component';

const routes: Routes = [
    { path: '', redirectTo: 'deposit', pathMatch: 'full' },
    { path: 'deposit', component: DepositComponent },
];

export const DepositRouter = routes;