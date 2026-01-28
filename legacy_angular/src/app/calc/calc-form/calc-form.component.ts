import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Calc } from 'src/app/model/calc';
import { CALC_KEYS, CALC_PURPOSES } from '../config/calc-config';

@Component({
  selector: 'app-calc-form',
  templateUrl: './calc-form.component.html',
  styleUrls: ['./calc-form.component.css']
})
export class CalcFormComponent implements OnInit {

  @Input() calc?: Calc;

  formGroup: FormGroup = this.formBuilder.group({});

  @Output() newItemEvent = new EventEmitter<Calc>();

  keySelects = CALC_KEYS;
  purposeSelects=CALC_PURPOSES;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formInit();
    this.formChangeUpdate();
  }

  formChangeUpdate() {
    this.formGroup.valueChanges.subscribe({
      next: value => {
        this.newItemEvent.emit(value);
      }
    }
    );
  }

  formInit() {
    this.formGroup = this.formBuilder.group({
      key: [this.calc ? this.calc.key : '', Validators.required],
      value: [this.calc ? this.calc.value : '', Validators.required],
      purpose: [this.calc ? this.calc.purpose : '', Validators.required],
      description: [this.calc ? this.calc.description : '', Validators.required]
    });
  }

}
