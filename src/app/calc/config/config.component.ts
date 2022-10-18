import { Component, OnInit } from '@angular/core';
import { Calc } from 'src/app/model/calc';
import { CalcService } from 'src/app/services/calc.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EditCalcDialogComponent } from '../edit-calc-dialog/edit-calc-dialog.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  configs: Calc[] = [];
  addConfigStatus: boolean = false;
  calcForm: Calc[] = [];
  saveCalcForm: Calc[] = [];

  assets: { total: number; category: string; }[] = [];
  incomes: { total: number; category: string; }[] = [];
  outputs: { total: number; category: string; }[] = [];
  deposits: { total: number; category: string; }[] = [];

  constructor(private calcService: CalcService, private sweetAlertService: SweetAlertService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.queryCalcConfigs();
  }

  queryCalcConfigs() {
    this.calcService.queryAllConfig().subscribe((res) => {
      this.configs = res;
      this.spiltCalcConfigs(res);
    });
  }

  changeAddConfigStatus() {
    this.addConfigStatus = !this.addConfigStatus;
    if (this.addConfigStatus && this.calcForm.length == 0) {
      let calc = new Calc();
      calc.key = 'month';
      this.calcForm.push(calc);
      this.saveCalcForm.push(calc);
    }

    if (!this.addConfigStatus) {
      this.syncSaveCalcForm();
    }
  }

  addCalcForm() {
    let calc = new Calc();
    calc.key = '每月';
    calc.purpose = '飲食';

    this.calcForm.splice(0, 0, calc);
    this.saveCalcForm.splice(0, 0, calc);

  }

  deleteCalcForm(index: number) {
    this.calcForm.splice(index, 1);
    this.saveCalcForm.splice(index, 1);
  }

  updateCalc(index: number, calc: Calc) {
    this.saveCalcForm[index] = calc;
  }

  copyCalcForm(index: number) {
    let calc = this.saveCalcForm[index];
    this.calcForm.splice(index + 1, 0, calc);
    this.saveCalcForm.splice(index + 1, 0, calc);
  }

  syncSaveCalcForm() {
    let calcForm: Calc[] = [];
    this.saveCalcForm.forEach(
      function (value) {
        calcForm.push(value);
      }
    );
    this.calcForm = calcForm;
  }

  resetCalcForms() {
    this.calcForm = [];
    this.saveCalcForm = [];
    let calc = new Calc();
    calc.key = '每月';
    calc.purpose = '飲食';
    this.calcForm.push(calc);
    this.saveCalcForm.push(calc);
  }

  saveAllCalcConfig() {
    let calcForm: Calc[] = [];

    this.saveCalcForm.forEach(
      function (value) {
        if (value.value != 0) {
          calcForm.push(value);
        }
      }
    );

    if (calcForm.length == 0) {
      this.sweetAlertService.error('there is not have useful info, plz check again', 'Oops...', 'calc configs not accept that value is ZERO');
      return;
    }

    Swal.fire({
      title: '<strong>Insert Configs</strong>',
      icon: 'info',
      html:
        'Just will save <b>those value is not zero</b>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'save',
      cancelButtonText: 'check again'
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveAllCalcConfigToDb(calcForm);
      }
    })
  }

  saveAllCalcConfigToDb(calcForm: Calc[]) {
    this.calcService.saveCalcConfigs(calcForm).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose('calc configs add successfully')
          this.queryCalcConfigs();
          this.resetCalcForms();
          this.changeAddConfigStatus();
        } else {
          this.sweetAlertService.error('something error in backend Server')
        }
      }
    );
  }
  removeCalcConfig(id: number, description: string) {
    Swal.fire({
      title: '<strong>Delete this Calc Config ?</strong>',
      text: '( ' + description + ' )',
      icon: 'info',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCalcConfig(id);
      }
    })
  }


  deleteCalcConfig(id: number) {
    this.calcService.deleteById(id).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose('calc configs remove successfully')
          this.queryCalcConfigs();
        } else {
          this.sweetAlertService.error('something error in backend Server')
        }
      }
    )
  }


  editCalcConfig(calcConfig: Calc) {
    const dialogRef = this.dialog.open(EditCalcDialogComponent, {
      width: '600px',
      minHeight: '430px',
      maxHeight: '900px',
      data: calcConfig
    })


    dialogRef.afterClosed().subscribe(result => {
      this.queryCalcConfigs();
    });
  }

  spiltCalcConfigs(calcConfigs: Calc[]) {
    let incomes: Calc[] = [];
    let outputs: Calc[] = [];
    let deposits: Calc[] = [];

    calcConfigs.forEach(function (value) {
      if (value.value > 0) {
        incomes.push(value);
      } else {
        if (value.purpose == '固定存款') {
          deposits.push(value);
        } else {
          outputs.push(value);
        }
      }
    });

    this.generateOutputArray(outputs);
    this.genereatDepositArray(deposits);
    this.genereatIncomeArray(incomes);
    this.genereatAssetArray();
  }

  genereatIncomeArray(calConfigs: Calc[]) {
    let array: { total: number; category: string; }[] = [];
    calConfigs.forEach(function (value) {
      let val = Math.abs(value.value);
      switch (value.key) {
        case '每日':
          val = val * 30;
          break;
        case '每周':
          val = val * 4;
          break;
        default:
          val = val;
          break;
      }

      let obj = {
        total: val,
        category: value.description
      }
      array.push(obj);
    })
    this.incomes = array;
  }

  genereatDepositArray(calConfigs: Calc[]) {
    let array: { total: number; category: string; }[] = [];
    calConfigs.forEach(function (value) {
      let val = Math.abs(value.value);
      switch (value.key) {
        case '每日':
          val = val * 30;
          break;
        case '每周':
          val = val * 4;
          break;
        default:
          val = val;
          break;
      }

      let obj = {
        total: val,
        category: value.description
      }
      array.push(obj);
    })
    this.deposits = array;
  }

  generateOutputArray(calConfigs: Calc[]) {
    let array: { total: number; category: string; }[] = [];
    calConfigs.forEach(function (value) {
      let val = Math.abs(value.value);
      switch (value.key) {
        case '每日':
          val = val * 30;
          break;
        case '每周':
          val = val * 4;
          break;
        default:
          val = val;
          break;
      }
      let obj = {
        total: val,
        category: value.description
      }
      array.push(obj);
    })
    this.outputs = array;
  }

  genereatAssetArray() {
    let array: { total: number; category: string; }[] = [];

    let totalMoney = 0;
    this.incomes.forEach(function (value) {
      totalMoney = totalMoney + value.total;
    })

    let totalCost = 0;
    this.deposits.forEach(function (value) {
      totalCost = totalCost + value.total;
      array.push(value);
    })
    this.outputs.forEach(function (value) {
      totalCost = totalCost + value.total;
      array.push(value);
    })

    let canUseMoney = {
      total: totalMoney - totalCost,
      category: 'canUseMoney'
    }

    array.push(canUseMoney);
    this.assets = array;

  }

}
