import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ShareModule } from '../share/share.module';



@NgModule({
  declarations: [
    HeaderComponent,
    SideBarComponent
  ],
  imports: [
    ShareModule
  ],
  exports:[
    HeaderComponent,
    SideBarComponent
  ]
})
export class BarsModule { }
