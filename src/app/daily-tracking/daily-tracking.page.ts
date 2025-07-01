import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DailyTrackingService } from '../services/daily-tracking.service';
import { StorageService } from '../services/storage.service';
import { NetworkService } from '../services/network.service';
import { User } from '../models/user.model';


@Component({
  selector: 'app-daily-tracking',
  templateUrl: './daily-tracking.page.html',
  styleUrls: ['./daily-tracking.page.scss'],
  standalone: false
})
export class DailyTrackingPage implements OnInit {

  fecha: string = new Date().toISOString();
  sueno: string = '';
  horasSueno: number | null = null;
  horasArray: number[] = Array.from({ length: 24 }, (_, i) => i + 1);
  animo: string = '';
  ejercicio: boolean = false;
  notas: string = '';

  userId!: number;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private dailyTrackingService: DailyTrackingService,
    private storageService: StorageService,
    private networkService: NetworkService
  ) { }

  async ngOnInit() {
    const user = await this.storageService.get<User>('user');
    if (user?.id) {
      this.userId = user.id;
      await this.cargarSeguimiento();
    } else {
      this.router.navigate(['/login']);
    }
  }

  async onFechaChange() {
    await this.cargarSeguimiento();
  }

  async cargarSeguimiento() {
    if (!this.userId) return;
    const fechaSolo = this.fecha.split('T')[0];

    const registro = await this.dailyTrackingService.getRecordByDate(this.userId, fechaSolo);
    if (registro) {
      this.sueno = registro.sueno;
      this.horasSueno = registro.horasSueno;
      this.animo = registro.animo;
      this.ejercicio = registro.ejercicio;
      this.notas = registro.notas;
    } else {
      this.sueno = '';
      this.horasSueno = null;
      this.animo = '';
      this.ejercicio = false;
      this.notas = '';
    }
  }

  formularioValido(): boolean {
    return this.sueno.trim() !== '' && this.animo.trim() !== '';
  }

  async guardarSeguimiento() {
    if (!this.formularioValido()) {
      await this.presentToast('Completa al menos el estado de ánimo y el sueño.', 'warning');
      return;
    }

    const fechaSolo = this.fecha.split('T')[0];

    const nuevoRegistro = {
      userId: this.userId,
      fecha: fechaSolo,
      sueno: this.sueno,
      horasSueno: this.horasSueno ?? 0,
      animo: this.animo,
      ejercicio: this.ejercicio,
      notas: this.notas,
      sincronizado: false
    };

    const online = await this.networkService.isOnline();

    if (online) {
      try {
        await this.dailyTrackingService.saveRecordOnline({ ...nuevoRegistro, sincronizado: true });
        await this.presentToast('¡Seguimiento guardado y sincronizado!', 'success');
      } catch (error) {
        await this.dailyTrackingService.saveRecordOffline(nuevoRegistro);
        await this.presentToast('Guardado offline. Se sincronizará luego.', 'medium');
      }
    } else {
      await this.dailyTrackingService.saveRecordOffline(nuevoRegistro);
      await this.presentToast('Guardado offline. Se sincronizará cuando haya conexión.', 'medium');
    }
  }

  private async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  irAStatistics() {
    this.router.navigate(['/statistics']);
  }


  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro/a que quieres cerrar tu sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: async () => {
            await this.storageService.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

}
