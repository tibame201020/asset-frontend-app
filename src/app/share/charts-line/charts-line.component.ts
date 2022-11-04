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
        selected: { 'expands': true, 'expands-line': true, 'incomes': false, 'incomes-line': false }
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: xAxisData,
        silent: true,
        splitLine: {
          show: false,
        },
      },
      yAxis: { 
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          y: '90%',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'expands',
          type: 'bar',
          data: expands,
          animationDelay: (idx: number) => idx * 10,
          itemStyle: {
            normal: {
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              label: {
                show: true,
                position: "top",
                formatter: function (param: { value: number; } | null) {
                  return param != null && param.value > 0? Math.round(param.value) : '';
                }
              }
            }
          }
        },
        {
          name: 'expands-line',
          type: 'line',
          smooth: true,
          data: expands,
          animationDelay: (idx: number) => idx * 10,
        },
        {
          name: 'incomes',
          type: 'bar',
          data: incomes,
          animationDelay: (idx: number) => idx * 10 + 100,
          itemStyle: {
            normal: {
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              label: {
                show: true,
                position: "top",
                formatter: function (param: { value: number; } | null) {
                  return param != null && param.value > 0? Math.round(param.value) : '';
                }
              }
            }
          }
        },
        {
          name: 'incomes-line',
          type: 'line',
          smooth: true,
          data: incomes,
          animationDelay: (idx: number) => idx * 10 + 100,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };
  }

}
