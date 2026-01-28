import { Component, OnInit } from '@angular/core';
import { SettingService } from 'src/app/services/setting.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private settingService:SettingService, private sweetAlertService:SweetAlertService) { }

  ngOnInit(): void {
  }

  resetConfirm(target:string){

    let title:string = 'reset ' + target;

    Swal.fire({
      title: '<strong>'+title+'</strong>',
      icon: 'info',
      html:
        'del all data and <b>no recv chance</b>',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetAll(target);
      }
    })
  }


  resetAll(target:string) {
    this.settingService.delAll(target).subscribe(
      res => {
        if (res) {
          this.sweetAlertService.autoClose(target + ' data were all deleted')
        } else {
          this.sweetAlertService.error('something error in backend');
        }
      }
    )
  }



}
