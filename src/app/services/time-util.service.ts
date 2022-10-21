import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeUtilService {

  constructor() { }

  daysInMonth (month?:number, year?:number) {
    return new Date(year?year:new Date().getFullYear(), month?month:new Date().getMonth() + 1, 0).getDate();
  }
}
