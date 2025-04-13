import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root', 
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  //show toast method
  async showToast(message: string, color: string = 'primary', duration: number = 2000, position: 'top' | 'middle' | 'bottom' = 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: position,
    });
    toast.present();
  }
}
