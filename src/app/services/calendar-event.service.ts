import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,} from 'rxjs';
import { environment } from 'src/environments/environment';
import { CalendarEvent } from '../model/calendar-event';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  addEventOption = false;

  constructor(private http: HttpClient) { }

  addEvent(calendarEvent:CalendarEvent):Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'calendar/add', calendarEvent);
  }

  queryEventsByRange(calendarEvent:CalendarEvent):Observable<CalendarEvent[]> {
    return this.http.post<CalendarEvent[]>(environment.apiUrl + 'calendar/queryEventsByRange', calendarEvent);
  }

  deleteById(id:number):Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'calendar/delete', parseInt(id+''));
  }


}
