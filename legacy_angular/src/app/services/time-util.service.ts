import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeUtilService {

  constructor() { }

  daysInMonth (month?:number, year?:number) {
    return new Date(year?year:new Date().getFullYear(), month?month:new Date().getMonth() + 1, 0).getDate();
  }

  removeTime(date?:Date | null) {
    return new Date(
      date?date.getFullYear():new Date().getFullYear(),
      date?date.getMonth():new Date().getMonth(),
      date?date.getDate():new Date().getDate()
    );
  }
}
