import { Component, Inject, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Calc } from 'src/app/model/calc';
import { CalcService } from 'src/app/services/calc.service';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormControl } from '@angular/forms';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { CALC_KEYS, CALC_PURPOSES } from '../config/calc-config';

@Component({
  selector: 'app-edit-calc-dialog',
  templateUrl: './edit-calc-dialog.component.html',
  styleUrls: ['./edit-calc-dialog.component.css']
})
export class EditCalcDialogComponent implements OnInit {

  keySelects = CALC_KEYS;
  purposeSelects=CALC_PURPOSES;

  formGroup: FormGroup = this.formBuilder.group({
    id: [this.calcConfig.id, Validators.required],
    key: [this.calcConfig.key, Validators.required],
    value: [this.calcConfig.value, Validators.required],
    purpose: [this.calcConfig.purpose , Validators.required],
    description: [this.calcConfig.description, Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<EditCalcDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public calcConfig: Calc,
    public dialog: MatDialog,
    private calcService: CalcService,
    private formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit(): void {
  }

  public saveCalc(formGroup: FormGroup): void {
    this.calcService.updateCalc(formGroup.value).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose('successful change')
          this.dialogRef.close();
        } else {
          this.sweetAlertService.error('bakend server error, plz try later or try fix that')
        }
      }
    )
  }


}
