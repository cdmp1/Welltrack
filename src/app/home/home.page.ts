import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserInfoService } from '../services/user-info.service';
import { UserInfo } from '../models/user-info.model'; 
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  usuario: string = '';
  password: string = '';
  modoEdicion: boolean = false;

  nombre: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  genero: string = '';
  objetivo: string = '';
  fechaNacimiento: Date | null = null;
  recibirNotificaciones: string = 'si';

  userId!: number;
  userInfoId?: number;

  imageSource: string | null = null;

  @ViewChild('inputNombre') inputNombre!: ElementRef;
  @ViewChild('inputApellido') inputApellido!: ElementRef;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private userInfoService: UserInfoService
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
    }

    const id = localStorage.getItem('userId');
    if (id) {
      this.userId = Number(id);

      this.userInfoService.getUserInfoByUserId(this.userId).subscribe({
        next: (res: UserInfo[]) => {
          if (res.length > 0) {
            const info = res[0];
            this.userInfoId = info.id;
            this.genero = info.genero;
            this.objetivo = info.objetivo;
            this.fechaNacimiento = new Date(info.fechaNacimiento);
            this.recibirNotificaciones = info.recibirNotificaciones ? 'si' : 'no';
          }
        },
        error: (err) => console.error('Error al obtener datos desde API', err)
      });
    } else {
      console.warn('No se encontró el ID del usuario');
    }
  }


  cancelarEdicion() {
    this.modoEdicion = false;
    this.ngOnInit();
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

    const infoActualizada: UserInfo = {
      userId: this.userId,
      genero: this.genero,
      objetivo: this.objetivo,
      fechaNacimiento: this.fechaNacimiento!,
      recibirNotificaciones: this.recibirNotificaciones === 'si'
    };

    if (this.userInfoId !== undefined) {
      this.userInfoService.updateUserInfo(this.userInfoId, infoActualizada).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: '¡Datos actualizados correctamente!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        },
        error: async () => {
          const toast = await this.toastController.create({
            message: 'Error al actualizar datos.',
            duration: 2000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      });
    } else {
      this.userInfoService.saveUserInfo(infoActualizada).subscribe({
        next: async (nuevo) => {
          this.userInfoId = nuevo.id;
          const toast = await this.toastController.create({
            message: '¡Datos guardados correctamente!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        },
        error: async () => {
          const toast = await this.toastController.create({
            message: 'Error al guardar datos.',
            duration: 2000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      });
    }
  }


async takePicture() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt 
    });

    this.imageSource = image.dataUrl ?? null;
  } catch (error) {
    console.error('No se pudo obtener la imagen', error);
  }
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
