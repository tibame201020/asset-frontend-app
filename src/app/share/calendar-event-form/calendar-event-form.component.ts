import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormControl } from '@angular/forms';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { timeRangeValidator } from '../validators/time.directive';
import { CalendarEvent } from 'src/app/model/calendar-event';

@Component({
  selector: 'app-calendar-event-form',
  templateUrl: './calendar-event-form.component.html',
  styleUrls: ['./calendar-event-form.component.css']
})
export class CalendarEventFormComponent implements OnInit {

  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#9fbd90',
      clockFaceTimeInactiveColor: '#fff'
    }
  };

  formGroup: FormGroup = new FormGroup({});

  constructor(
    public dialogRef: MatDialogRef<CalendarEventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public calendarEvent: CalendarEvent,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private calendarEventService: CalendarEventService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      dateStr: [this.calendarEvent.dateStr, Validators.required],
      title: [this.calendarEvent.title?this.calendarEvent.title:'', Validators.required],
      start: [this.calendarEvent.start?this.calendarEvent.start:'', Validators.required],
      end: [this.calendarEvent.end?this.calendarEvent.end:'', Validators.required],
      id: [this.calendarEvent.id?this.calendarEvent.id:null],
    }, { validators: timeRangeValidator })
  }

  public addCalendarEvent(formGroup: FormGroup): void {
    let fullYearMonthDay = formGroup.value.dateStr.toLocaleString('zh-TW', { year: "numeric", month: "2-digit", day: "2-digit" });
    let month = fullYearMonthDay.replaceAll("-", "").replaceAll("/", "").substring(0, 6);
    formGroup.value.month = parseInt(month);
    formGroup.value.startText = formGroup.value.start
    formGroup.value.endText = formGroup.value.end

    formGroup.value.start = this.transTime(formGroup.value.start, fullYearMonthDay);
    formGroup.value.end = this.transTime(formGroup.value.end, fullYearMonthDay);
    formGroup.value.logTime = new Date();
    if (this.calendarEvent.id == -1) {
      formGroup.value.id = null;
    }

    this.calendarEventService.addEvent(formGroup.value).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose('successful change')
          this.dialogRef.close();
        } else {
          this.sweetAlertService.error('backend server error, plz try later or try fix that')
        }
      }
    )

  }

  transTime(time: string, dateStr:string) {
    let date = new Date(dateStr);
    let where = time.substring(time.length - 2, time.length);
    time = time.replace(':', '').replace(' AM', '').replace(' PM', '');
    let timeNum;
    switch (where) {
      case 'PM':
        timeNum = parseInt(time) + 1200;
        break;
      default:
        timeNum = parseInt(time);
        break;
    }
    if (timeNum.toString().length == 3) {
      date.setHours(parseInt(timeNum.toString().substring(0, 1)));
      date.setMinutes(parseInt(timeNum.toString().substring(1)));
    } else {
      date.setHours(parseInt(timeNum.toString().substring(0, 2)));
      date.setMinutes(parseInt(timeNum.toString().substring(2)));
    }
    return date;
  }

  transAmPm(time: string) {
    let where = time.substring(time.length - 2, time.length);
    time = time.replace(':', '').replace(' AM', '').replace(' PM', '');
    switch (where) {
      case 'PM':
        return parseInt(time) + 1200;
      default:
        return parseInt(time);
    }
  }

}
