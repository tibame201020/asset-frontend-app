import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TransLog } from 'src/app/model/trans-log';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { TimeUtilService } from 'src/app/services/time-util.service';
import { TransLogService } from 'src/app/services/trans-log.service';
import Swal from 'sweetalert2';
import { DepositFormComponent } from '../deposit-form/deposit-form.component';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {


  transLogArray:TransLog[] = [];

  constructor(public dialog: MatDialog, private transLogService:TransLogService, private sweetAlertService:SweetAlertService, private timeUtilService:TimeUtilService) { }

  ngOnInit(): void {
    this.initDateRange();
    this.formChangeUpdate();
  }

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    type: new FormControl<string | null>(null),
  });

  initDateRange() {
    let end = new Date();
    let start = new Date(new Date().setDate(end.getDate() - 30));
    this.range.patchValue({
      start:start,
      end:end,
      type:'all'
    })
    this.getDateRangeList();
  }
  getDateRangeList() {

    let start = this.timeUtilService.removeTime(this.range.value.start);

    let endDate = this.range.value.end?this.range.value.end:new Date();

    let end = this.timeUtilService.removeTime(new Date(new Date().setDate(endDate.getDate() + 1)));

    let rangeValue = {
      start:start,
      end:end,
      type:this.range.value.type
    };
    this.transLogService.queryByDateRange(rangeValue).subscribe(
      res => {
        this.transLogArray = res
      }
    )
  }

  formChangeUpdate() {
    this.range.valueChanges.subscribe({
      next: value => {
        this.getDateRangeList();
      }
    }
    );
  }

  openDepositForm(transLog?:TransLog) {
    const dialogRef = this.dialog.open(DepositFormComponent, {
      width: '600px',
      minHeight: '530px',
      maxHeight: '900px',
      data: {
        transDate:transLog?.transDate,
        type:transLog?.type?transLog.type:'支出',
        category:transLog?.category,
        name:transLog?.name,
        value:transLog?.value,
        ps:transLog?.ps,
        id:transLog?.id
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getDateRangeList();
    });
  }

  editTransLog(transLog:TransLog) {
    this.openDepositForm(transLog);
  }

  removeConfirm(id:number) {
    Swal.fire({
      icon:'info',
      title: 'Do you want to remove the trans-log?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: `Cancel`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeTransLog(id)
      }
    })
  }

  removeTransLog(id:number) {
    this.transLogService.deleteTransLog(id).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose('successfully delete')
        } else {
          this.sweetAlertService.error('something error in backend Server')
        }
        this.getDateRangeList();
      }
    )
  }

}
