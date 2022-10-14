import { Component, OnInit } from '@angular/core';
import { Calc } from 'src/app/model/calc';
import { CalcService } from 'src/app/services/calc.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  configs: Calc[] = [];
  addConfigStatus: boolean = false;
  calcForm: Calc[] = [];
  saveCalcForm:Calc[] = [];

  constructor(private calcService: CalcService, private sweetAlertService:SweetAlertService) {
  }

  ngOnInit(): void {
    this.queryCalcConfigs();
  }

  queryCalcConfigs() {
    this.calcService.queryAllConfig().subscribe((res) => {
      this.configs = res;
      console.log('configs = ' + this.configs)
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
    calc.key = 'month';

    this.calcForm.splice(0, 0, calc);
    this.saveCalcForm.splice(0, 0, calc);

  }

  deleteCalcForm(index:number) {
    this.calcForm.splice(index, 1);
    this.saveCalcForm.splice(index, 1);
  }

  updateCalc(index:number, calc:Calc) {
    this.saveCalcForm[index] = calc;
  }

  copyCalcForm(index:number) {
    let calc = this.saveCalcForm[index];
    this.calcForm.splice(index +1, 0, calc);
    this.saveCalcForm.splice(index +1, 0, calc);
  }

  syncSaveCalcForm() {
    let calcForm:Calc[] = [];
    this.saveCalcForm.forEach(
      function(value) {
        calcForm.push(value);
      }
    );
    this.calcForm = calcForm;
  }

  resetCalcForms() {
    this.calcForm = [];
    this.saveCalcForm = [];
    let calc = new Calc();
      calc.key = 'month';
      this.calcForm.push(calc);
      this.saveCalcForm.push(calc);
  }

  saveAllCalcConfig() {
    let calcForm:Calc[] = [];

    this.saveCalcForm.forEach(
      function(value) {
        if (value.value != 0) {
          calcForm.push(value);
        }
      }
    );

    console.log('save form = ', calcForm);

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
      confirmButtonText:'save',
      cancelButtonText:'check again'
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveAllCalcConfigToDb(calcForm);
      } 
    })
  }

  saveAllCalcConfigToDb(calcForm:Calc[]) {
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
  removeCalcConfig(id:number) {
    Swal.fire({
      title: '<strong>Delete Calc Config</strong>',
      icon: 'info',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText:'Delete',
      cancelButtonText:'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCalcConfig(id);
      } 
    })
  }


  deleteCalcConfig(id:number) {
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


  editCalcConfig(id:number) {
    this.calcService.queryById(id).subscribe(
      res => {
        console.log(res);  
      }
    );
    }
}
