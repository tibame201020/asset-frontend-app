import { Component } from '@angular/core';
import { SideBarService } from './bars/side-bar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'asset-frontend-app';

  constructor(public sideBarService:SideBarService) {

  }
}
