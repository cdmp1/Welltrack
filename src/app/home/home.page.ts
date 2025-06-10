import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  // Datos recibidos del Login
  usuario: string = '';
  password: string = '';

  // Datos del formulario de información
  modoEdicion: boolean = false;

  nombre: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  genero: string = '';
  objetivo: string = '';
  fechaNacimiento: Date | null = null;

  datosGuardados: any = {};

  recibirNotificaciones: string = 'si';


  // Referencias a los inputs para animación
  @ViewChild('inputNombre') inputNombre!: ElementRef;
  @ViewChild('inputApellido') inputApellido!: ElementRef;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state) {
      this.usuario = state['usuario'] || '';
      this.password = state['password'] || '';
      this.nombre = state['nombre'] || '';
      this.apellidoPaterno = state['apellidoPaterno'] || '';
      this.apellidoMaterno = state['apellidoMaterno'] || '';
    } else {
      console.warn('No se recibieron datos desde Login');
    }

    const datos = localStorage.getItem('datosUsuario');
    if (datos) {
      this.datosGuardados = JSON.parse(datos);
      this.genero = this.datosGuardados.genero || '';
      this.objetivo = this.datosGuardados.objetivo || '';
      this.fechaNacimiento = this.datosGuardados.fechaNacimiento || null;
    }
  }


  cancelarEdicion() {
  this.modoEdicion = false;
  const datos = localStorage.getItem('datosUsuario');
  if (datos) {
    const recuperados = JSON.parse(datos);
    this.nombre = recuperados.nombre || '';
    this.apellidoPaterno = recuperados.apellidop || '';
    this.apellidoMaterno = recuperados.apellidom || '';
    this.genero = recuperados.genero || '';
    this.objetivo = recuperados.objetivo || '';
    this.fechaNacimiento = recuperados.fechaNacimiento || null;
  }
}

  irADailyTracking() {
  this.router.navigate(['/daily-tracking']);
}


  async limpiarCampos() {
    this.nombre = '';
    this.apellidoPaterno = '';
    this.apellidoMaterno = '';
    this.genero = '';
    this.objetivo = '';
    this.fechaNacimiento = null;
    this.recibirNotificaciones = '';

    this.animarInput(this.inputNombre);
    this.animarInput(this.inputApellido);

    const toast = await this.toastController.create({
      message: 'Campos limpiados correctamente.',
      duration: 2000,
      color: 'medium',
      position: 'top'
    });

    await toast.present();
  }

  animarInput(input: ElementRef) {
    const nativeElement = input.nativeElement;
    nativeElement.classList.add('shake');

    setTimeout(() => {
      nativeElement.classList.remove('shake');
    }, 1000);
  }

  async guardarDatos() {
    if (
      !this.nombre ||
      !this.apellidoPaterno ||
      !this.apellidoMaterno ||
      !this.fechaNacimiento ||
      !this.genero ||
      !this.objetivo ||
      !this.recibirNotificaciones
    ) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos antes de guardar.',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const datosActualizados = {
      usuario: this.usuario,
      password: this.password,
      nombre: this.nombre,
      apellidop: this.apellidoPaterno,
      apellidom: this.apellidoMaterno,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      objetivo: this.objetivo,
      recibirNotificaciones: this.recibirNotificaciones,
    };

    localStorage.setItem('datosUsuario', JSON.stringify(datosActualizados));

    const toast = await this.toastController.create({
      message: '¡Datos guardados correctamente!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });

    await toast.present();
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro/a que quieres cerrar tu sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
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
