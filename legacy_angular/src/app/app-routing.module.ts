import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalcRouter } from './calc/calc.routing';
import { CalendarRouter } from './calendar/calendar.routing';
import { DepositRouter } from './deposit/deposit.routing';
import { SettingRouter } from './setting/setting.routing';

const routes: Routes = [
  {path:'deposit', children:DepositRouter},
  {path:'calc', children:CalcRouter},
  {path:'calendar',children:CalendarRouter},
  {path:'setting', children:SettingRouter},
  {path:'', redirectTo:"/calendar/home", pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
