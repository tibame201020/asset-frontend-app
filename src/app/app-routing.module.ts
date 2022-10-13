import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalcRouter } from './calc/calc.routing';
import { CalendarRouter } from './calendar/calendar.routing';
import { DepositRouter } from './deposit/deposit.routing';
import { FrontIndexComponent } from './front-index/front-index.component';
import { SettingRouter } from './setting/setting.routing';

const routes: Routes = [
  {path:"home", component:FrontIndexComponent},
  {path:'deposit', children:DepositRouter},
  {path:'calc', children:CalcRouter},
  {path:'calendar',children:CalendarRouter},
  {path:'setting', children:SettingRouter},
  {path:'', redirectTo:"/home", pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
