import { Component, OnInit, SimpleChanges } from '@angular/core';

import {
  CalendarOptions,
  defineFullCalendarElement,
} from '@fullcalendar/web-component';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEventFormComponent } from '../calendar-event-form/calendar-event-form.component';

defineFullCalendarElement();

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  calendarOptions!: CalendarOptions;
  
  constructor(public calendarEventService:CalendarEventService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.setOption();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  setOption() {
    this.calendarOptions = {
      dateClick: this.dateClick.bind(this),
      datesSet: this.handleDatesRender.bind(this),
      eventClick: this.eventClick.bind(this),
      plugins: [dayGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek',
      },
      height: window.innerHeight - 100,
      windowResize: this.resizeCalendar.bind(this),
    };
  }

  resizeCalendar() {
    this.setOption();
  }

  dateClick(arg: any) {
    console.log('dateClick =', arg);
    if (this.calendarEventService.addEventOption) {
      this.addCalendarEvent(arg.dateStr)
    }

    console.log('dateClick =', arg);
  }

  handleDatesRender(arg: any) {
    console.log('handleDatesRender =', arg);
  }

  eventClick(arg: any) {
    console.log('eventClick =', arg);
  }

  addCalendarEvent(dateStr:string) {
    const dialogRef = this.dialog.open(CalendarEventFormComponent, {
      width: '600px',
      minHeight: '530px',
      maxHeight: '900px',
      data: dateStr
    })


    dialogRef.afterClosed().subscribe(result => {
      console.log('dialog close~')
    });
  }
}
