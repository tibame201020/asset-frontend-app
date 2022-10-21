import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

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
    const data: { value: number; name: string; }[] = [];
    this.data.forEach((element: { total: any; category: any; }) => {
      data.push({
        value: element.total,
        name: element.category
      });
    });
    this.options = {
      legend: {
        x: 'left',
        y: 'top'
      },
      tooltip: {},
      series: [
        {
          name: 'composition',
          type: 'pie',
          radius: '75%',
          center: ['35%', '50%'],
          data: data,
          itemStyle: {
            normal: {
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              label: {
                show: true,
                formatter: '{b} : {d}%',
                distance: 0.7
              }
            }
          }
        }
      ]
    }
  }

}
