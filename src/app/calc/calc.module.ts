import { NgModule } from '@angular/core';
import { ShareModule } from '../share/share.module';
import { HomeComponent } from './home/home.component';
import { ConfigComponent } from './config/config.component';



@NgModule({
  declarations: [
    HomeComponent,
    ConfigComponent
  ],
  imports: [
    ShareModule
  ]
})
export class CalcModule { }
