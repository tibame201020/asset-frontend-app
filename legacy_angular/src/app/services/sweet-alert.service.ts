import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  base(message?: string) {
    Swal.fire(message ? message : 'default message');
  }

  autoClose(message?: string, icon?: SweetAlertIcon, position?: SweetAlertPosition, timer?: number) {
    Swal.fire({
      position: position ? position : 'center',
      icon: icon ? icon : 'success',
      title: message ? message : 'default message',
      showConfirmButton: false,
      timer: timer ? timer : 1500
    });
  }

  error(message?: string, title?: string, footer?: string) {
    Swal.fire({
      icon: 'error',
      title: title ? title : 'Oops...',
      text: message ? message : 'default error message',
      footer: footer ? footer : ''
    })
  }

}
