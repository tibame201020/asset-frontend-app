import { Injectable } from '@angular/core';
import { CALC_SIDE_BAR, CALENDAR_SIDE_BAR, DEPOSIT_SIDE_BAR, HOME_SIDE_BAR, SETTING_SIDE_BAR } from '../bars/config/side-bar';
import { Bar } from '../model/bar';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  sidebar: Bar = HOME_SIDE_BAR;
  constructor() { }

  init() {
    let path = window.location.pathname;
    switch (true) {
      case path == '/home':
        return false;
      case path == '/':
        return false;
      case path.includes('/deposit'):
        this.sidebar = DEPOSIT_SIDE_BAR;
        return true;
      case path.includes('/calc'):
        this.sidebar = CALC_SIDE_BAR;
        return true;
      case path.includes('/calendar'):
        this.sidebar = CALENDAR_SIDE_BAR;
        return true;
      case path.includes('/setting'):
        this.sidebar = SETTING_SIDE_BAR;
        return true;
      default:
        return false;
    }
  }

}
