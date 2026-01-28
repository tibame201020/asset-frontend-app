import { Component, OnInit } from '@angular/core';
import { SideBarService } from '../../services/side-bar.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(public sideBarService:SideBarService) { }

  ngOnInit(): void {
  }

}
