import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';


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

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarSeguimiento();
  }

  onFechaChange() {
    this.cargarSeguimiento();
  }

  cargarSeguimiento() {
    const registros = JSON.parse(localStorage.getItem('seguimientoDiario') || '{}');
    const fechaClave = new Date(this.fecha).toLocaleDateString('es-ES');

    const data = registros[fechaClave];
    if (data) {
      this.sueno = data.sueno;
      this.horasSueno = data.horasSueno ?? null;
      this.animo = data.animo;
      this.ejercicio = data.ejercicio;
      this.notas = data.notas;
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
      return toast.present();
    }

    const fechaClave = new Date(this.fecha).toLocaleDateString('es-ES');
    const nuevoRegistro = {
      sueno: this.sueno,
      horasSueno: this.horasSueno,
      animo: this.animo,
      ejercicio: this.ejercicio,
      notas: this.notas
    };

    const registros = JSON.parse(localStorage.getItem('seguimientoDiario') || '{}');
    registros[fechaClave] = nuevoRegistro;
    localStorage.setItem('seguimientoDiario', JSON.stringify(registros));

    const toast = await this.toastController.create({
      message: '¡Seguimiento guardado!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });

    await toast.present();
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro/a de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}


