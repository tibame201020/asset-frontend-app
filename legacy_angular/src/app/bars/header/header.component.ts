import { Component, OnInit } from '@angular/core';
import { HEADER } from '../config/header';
import { Bar } from '../../model/bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  header: Bar = HEADER;


  constructor() { }

  ngOnInit(): void {
  }

}
