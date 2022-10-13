import { NgModule } from '@angular/core';
import { ShareModule } from '../share/share.module';
import { HomeComponent } from './home/home.component';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    ShareModule
  ]
})
export class CalcModule { }
