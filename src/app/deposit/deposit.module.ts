import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ShareModule } from '../share/share.module';
import { DepositComponent } from './deposit/deposit.component';
import { DepositFormComponent } from './deposit-form/deposit-form.component';



@NgModule({
  declarations: [
    HomeComponent,
    DepositComponent,
    DepositFormComponent
  ],
  imports: [
    ShareModule
  ]
})
export class DepositModule { }
