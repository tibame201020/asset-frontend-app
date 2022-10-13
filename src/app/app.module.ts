import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BarsModule } from './bars/bars.module';
import { AppRoutingModule } from './app-routing.module';
import { DepositModule } from './deposit/deposit.module';
import { SettingModule } from './setting/setting.module';
import { CalcModule } from './calc/calc.module';
import { CommonModule } from '@angular/common';
import { FrontIndexComponent } from './front-index/front-index.component';

@NgModule({
  declarations: [AppComponent, FrontIndexComponent],
  imports: [BarsModule, AppRoutingModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
