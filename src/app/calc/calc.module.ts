import { NgModule } from '@angular/core';
import { ShareModule } from '../share/share.module';
import { ConfigComponent } from './config/config.component';
import { CalcFormComponent } from './calc-form/calc-form.component';
import { EditCalcDialogComponent } from './edit-calc-dialog/edit-calc-dialog.component';



@NgModule({
  declarations: [
    ConfigComponent,
    CalcFormComponent,
    EditCalcDialogComponent
  ],
  imports: [
    ShareModule
  ]
})
export class CalcModule { }
