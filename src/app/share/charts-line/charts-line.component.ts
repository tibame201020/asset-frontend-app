import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-charts-line',
  templateUrl: './charts-line.component.html',
  styleUrls: ['./charts-line.component.css']
})
export class ChartsLineComponent implements OnInit {
  @Input() data: any;
  options: any;

  constructor() { }

  ngOnInit(): void {
    this.setOption();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setOption();
  }

  setOption() {

    if (!this.data) {
      return;
    }

    let xAxisData: any[] = [];
    const expands: any[] = [];
    const incomes: any[] = [];

    this.data.forEach(function(obj: any) {
      xAxisData.push(obj.date)
      expands.push(obj.expandsTotal)
      incomes.push(obj.incomeTotal)
    })

    this.options = {
      legend: {
        data: ['expands','expands-line', 'incomes', 'incomes-line'],
        align: 'left',
        selected: { 'expands': true, 'expands-line': false, 'incomes': false, 'incomes-line': false }
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          name: 'expands',
          type: 'bar',
          data: expands,
          animationDelay: (idx: number) => idx * 10,
        },
        {
          name: 'expands-line',
          type: 'line',
          data: expands,
          animationDelay: (idx: number) => idx * 10,
        },
        {
          name: 'incomes',
          type: 'bar',
          data: incomes,
          animationDelay: (idx: number) => idx * 10 + 100,
        },
        {
          name: 'incomes-line',
          type: 'line',
          data: incomes,
          animationDelay: (idx: number) => idx * 10 + 100,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };
  }

}
