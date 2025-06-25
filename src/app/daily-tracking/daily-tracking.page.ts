import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DailyTrackingService } from '../services/daily-tracking.service';
import { Storage } from '@ionic/storage-angular';
import { NetworkService } from '../services/network.service';


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
    private storage: Storage,
    private networkService: NetworkService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const id = await this.storage.get('userId');
    if (id) this.userId = Number(id);
    this.cargarSeguimiento();
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
    const toast = await this.toastController.create({
      message: 'Completa al menos el estado de ánimo y el sueño.',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
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
      await this.dailyTrackingService.saveRecordOnline(nuevoRegistro);
      const toast = await this.toastController.create({
        message: '¡Seguimiento guardado y sincronizado!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      await this.dailyTrackingService.saveRecordOffline(nuevoRegistro);
      const toast = await this.toastController.create({
        message: 'Guardado offline. Se sincronizará luego.',
        duration: 2000,
        color: 'medium',
        position: 'top'
      });
      await toast.present();
    }
  } else {
    await this.dailyTrackingService.saveRecordOffline(nuevoRegistro);
    const toast = await this.toastController.create({
      message: 'Guardado offline. Se sincronizará cuando haya conexión.',
      duration: 2000,
      color: 'medium',
      position: 'top'
    });
    await toast.present();
  }
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
            await this.storage.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

}
