import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormControl } from '@angular/forms';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { DEPOSIT_EXPAND_CATEGORY, DEPOSIT_SELECT_TYPE, DEPOSIT_INCOME_CATEGORY } from '../config/deposit-config';
import { TransLogService } from 'src/app/services/trans-log.service';

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.css']
})
export class DepositFormComponent implements OnInit {


  formGroup: FormGroup = new FormGroup({});
  constructor(public dialogRef: MatDialogRef<DepositFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private transLogService:TransLogService) { }

  ngOnInit(): void {
    this.initForm();
  }

  getTypeOptions() {
    return DEPOSIT_SELECT_TYPE;
  }

  getCategoryOptions() {
    let type = this.formGroup.value.type;
    switch(type) {
      case '支出':
        return DEPOSIT_EXPAND_CATEGORY;
      case '收入':
        return DEPOSIT_INCOME_CATEGORY;
    }
    return [];
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      transDate:[this.data.transDate? new Date(this.data.transDate) : new Date(), Validators.required],
      type:[this.data.type? this.data.type : '', Validators.required],
      category:[this.data.category? this.data.category : '', Validators.required],
      name:[this.data.name? this.data.name : '', Validators.required],
      value:[this.data.value? this.data.value : '', Validators.required],
      ps:[this.data.ps? this.data.ps : ''],
      id:[this.data.id? this.data.id : ''],
    })
  }

  public addTransLog(formGroup: FormGroup): void {

    let successfullyMsg:string;
    if (formGroup.value.id) {
      successfullyMsg = 'trans log save successfully';
    } else {
      successfullyMsg = 'trans log add successfully';
    }

    this.transLogService.saveTransLog(formGroup.value).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose(successfullyMsg)
        } else {
          this.sweetAlertService.error('something error in backend Server')
        }
        this.dialogRef.close()
      }
    )
  }

}
