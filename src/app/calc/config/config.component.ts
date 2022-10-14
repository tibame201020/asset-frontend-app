import { Component, OnInit } from '@angular/core';
import { Calc } from 'src/app/model/calc';
import { CalcService } from 'src/app/services/calc.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  configs: Calc[] = [];

  constructor(private calcService: CalcService) {}

  ngOnInit(): void {
    this.calcService.queryAllConfig().subscribe((res) => {
      this.configs = res;
    });
  }
}
