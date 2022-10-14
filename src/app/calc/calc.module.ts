import { NgModule } from '@angular/core';
import { ShareModule } from '../share/share.module';
import { HomeComponent } from './home/home.component';
import { ConfigComponent } from './config/config.component';
import { CalcFormComponent } from './calc-form/calc-form.component';



@NgModule({
  declarations: [
    HomeComponent,
    ConfigComponent,
    CalcFormComponent
  ],
  imports: [
    ShareModule
  ]
})
export class CalcModule { }
