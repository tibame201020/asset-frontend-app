import { Component, OnInit, SimpleChanges } from '@angular/core';

import {
  CalendarOptions,
  defineFullCalendarElement,
  EventSourceInput,
} from '@fullcalendar/web-component';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEventFormComponent } from '../calendar-event-form/calendar-event-form.component';
import { CalendarEvent } from 'src/app/model/calendar-event';

defineFullCalendarElement();

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  calendarOptions!: CalendarOptions;
  events: any[] = [];

  start: any;
  end: any;
  selectedDate: any;

  daylist: CalendarEvent[] = [];

  constructor(
    public calendarEventService: CalendarEventService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setOption();
  }

  ngOnChanges(changes: SimpleChanges): void {}

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
      height: window.innerHeight - 200,
      windowResize: this.resizeCalendar.bind(this),
      events: this.events,
    };
  }

  resizeCalendar() {
    this.setOption();
  }

  dateClick(arg: any) {
    if (this.calendarEventService.addEventOption) {
      this.addCalendarEvent(arg.dateStr);
    }
    this.selectedDate = arg.date;
    this.getUpdateDayList();
  }

  handleDatesRender(arg: any) {
    this.start = arg.start;
    this.end = arg.end;
    this.getUpdateRender();
  }

  getUpdateDayList() {
    let calendarEvent: CalendarEvent = {
      start: this.selectedDate,
      end: this.selectedDate,
      id: 0,
      title: '',
      month: 0,
      dateStr: '',
      logTime: new Date(),
      startText: '',
      endText: '',
    };
    this.calendarEventService
      .queryEventsByRange(calendarEvent)
      .subscribe((res) => {
        if (res) {
          this.daylist = res;
        }
      });
  }

  getUpdateRender() {
    let calendarEvent: CalendarEvent = {
      start: this.start,
      end: this.end,
      id: 0,
      title: '',
      month: 0,
      dateStr: '',
      logTime: new Date(),
      startText: '',
      endText: '',
    };
    this.calendarEventService
      .queryEventsByRange(calendarEvent)
      .subscribe((res) => {
        if (res) {
          let events: any[] = [];
          res.forEach(function (calendarEvent) {
            let event = {
              title: calendarEvent.title,
              start: new Date(calendarEvent.start),
              end: new Date(calendarEvent.end),
              id: calendarEvent.id,
              extendedProps: calendarEvent,
            };
            events.push(event);
          });
          this.events = events;
          this.setOption();
        }
      });
  }

  eventClick(arg: any) {
    let calendarEvent = {
      dateStr: arg.event.start,
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.extendedProps.startText,
      end: arg.event.extendedProps.endText,
    };

    const dialogRef = this.dialog.open(CalendarEventFormComponent, {
      width: '600px',
      minHeight: '530px',
      maxHeight: '900px',
      data: calendarEvent,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getUpdateRender();
      this.getUpdateDayList();
    });
  }

  addCalendarEvent(dateStr: string) {
    let calendarEvent = {
      dateStr: dateStr,
    };
    const dialogRef = this.dialog.open(CalendarEventFormComponent, {
      width: '600px',
      minHeight: '530px',
      maxHeight: '900px',
      data: calendarEvent,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getUpdateRender();
      this.getUpdateDayList();
    });
  }
}
