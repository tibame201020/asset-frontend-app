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

  incomes: { total: number; category: string; }[] = [];
  expands: { total: number; category: string; }[] = [];
  dateArrays:any[] = [];

  totalIncomes = 0;
  totalExpands = 0;

  start:any;
  end:any;

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
    let start = new Date(end.getTime() - 24*60*60*1000*30);
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
    let end = this.timeUtilService.removeTime(new Date(endDate.getTime() + 24*60*60*1000));

    this.start = start;
    this.end = end;

    let rangeValue = {
      start:this.start,
      end:this.end,
      type:this.range.value.type
    };
    this.transLogService.queryByDateRange(rangeValue).subscribe(
      res => {
        this.transLogArray = res;
        this.spiltTransLogs(res);
      }
    )
  }

  formChangeUpdate() {
    this.range.valueChanges.subscribe({
      next: value => {
        console.log(value)
        this.getDateRangeList();
      }
    }
    );
  }

  openDepositForm(transLog?:any) {
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

  spiltTransLogs(transLogs: TransLog[]) {
    let incomes: { total: number; category: string; }[] = [];
    let expands: { total: number; category: string; }[] = [];

    let totalIncomes = 0;
    let totalExpands = 0;

    let date1 = this.start;
    let date2 = this.end;
    let dateArrays = [];

    while( date1 < date2 ) {

      let date = new Date(date1).toLocaleString('zh-TW', { year: "numeric", month: "2-digit", day: "2-digit" });

      let incomeTotal = 0;
      let expandsTotal = 0;
      transLogs.forEach(function(value) {
        let transDate = new Date(value.transDate).toLocaleString('zh-TW', { year: "numeric", month: "2-digit", day: "2-digit" });
        if (transDate == date) {
          if (value.type == '支出') {
            expandsTotal = expandsTotal + value.value
          }
          if (value.type == '收入') {
            incomeTotal = incomeTotal + value.value
          }
        }
      })
      let obj = {
        date:date,
        incomeTotal:incomeTotal,
        expandsTotal:expandsTotal
      }
      dateArrays.push(obj)
      date1.setDate( date1.getDate() +1 );
    }

    this.dateArrays = dateArrays;

    transLogs.forEach(function(value) {
      let obj = {
        total: value.value,
        category: value.category
      }

      if (value.type == '支出') {
        totalExpands = totalExpands + obj.total;
        expands.push(obj)
      }
      if (value.type == '收入') {
        totalIncomes = totalIncomes + obj.total;
        incomes.push(obj)
      }
    })

    this.incomes = this.groupByKey(this.splitItmGroupByKey(incomes, 'category'));
    this.expands = this.groupByKey(this.splitItmGroupByKey(expands, 'category'));

    this.totalIncomes = totalIncomes;
    this.totalExpands = totalExpands;

  }

  quickCopy(transLog: TransLog) {
    let obj = {
        transDate:null,
        type:transLog?.type?transLog.type:'支出',
        category:transLog?.category,
        name:transLog?.name,
        value:transLog?.value,
        ps:transLog?.ps,
        id:null
    }

    this.openDepositForm(obj);
  }

  splitItmGroupByKey(items: any[], key: string, type?: string) {
    let rtnObj: any = {};
    items.forEach(item => {
      if (!rtnObj[item[key]]) {
        rtnObj[item[key]] = [];
      }
      rtnObj[item[key]].push(item);
    });

    if (type == 'obj') {
      return rtnObj;
    }

    let rtnArray: any[] = [];

    Object.keys(rtnObj).forEach(key => {
      let data: any = {
        key: key,
        dataArray: rtnObj[key]
      }
      rtnArray.push(data);
    });

    return rtnArray;
  }

  groupByKey(items: any[]) {
    let rtnArray: any[] = [];

    items.forEach(function(value){
      let total = 0;

      value.dataArray.forEach(function(data:any){
        total = total + data.total
      })



      let obj = {
        total: total,
        category: value.key
      }

      rtnArray.push(obj)
    })


    return rtnArray;
  }

}
