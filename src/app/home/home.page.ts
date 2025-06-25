import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserInfoService } from '../services/user-info.service';
import { UserInfo } from '../models/user-info.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';
import { NetworkService } from '../services/network.service';
import { DbTaskService } from '../services/db-task.service';
import { Subscription } from 'rxjs';
import { SyncService } from '../services/sync.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

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

  private networkSub!: Subscription;

  @ViewChild('inputNombre') inputNombre!: ElementRef;
  @ViewChild('inputApellido') inputApellido!: ElementRef;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private userInfoService: UserInfoService,
    private storage: Storage,
    private networkService: NetworkService,
    private dbTaskService: DbTaskService,
    private syncService: SyncService
  ) {}

  async ngOnInit() {
    await this.storage.create();

    const online = await this.networkService.isOnline();
    if (online) {
      await this.syncService.syncPendingData();
    }

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state) {
      this.usuario = state['usuario'] || '';
      this.password = state['password'] || '';
      this.nombre = state['nombre'] || '';
      this.apellidoPaterno = state['apellidoPaterno'] || '';
      this.apellidoMaterno = state['apellidoMaterno'] || '';
    }

    const id = await this.storage.get('userId');
    if (id) {
      this.userId = Number(id);
      await this.obtenerDatosUsuario();
    }

    this.verificarConexion();

    this.networkSub = this.networkService.getNetworkStatus().subscribe(async (isOnline) => {
      if (!isOnline) {
        const alert = await this.alertCtrl.create({
          header: 'Sin conexión',
          message: 'Estás desconectado. Algunos datos podrían no cargarse.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  ngOnDestroy() {
    if (this.networkSub) {
      this.networkSub.unsubscribe();
    }
  }

  async obtenerDatosUsuario() {
    const isOnline = await this.networkService.isOnline();

    if (isOnline) {
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
      const datosOffline = await this.dbTaskService.getPendingUserInfo();
      const info = datosOffline.find(i => i.userId === this.userId);
      if (info) {
        this.genero = info.genero;
        this.objetivo = info.objetivo;
        this.fechaNacimiento = new Date(info.fechaNacimiento);
        this.recibirNotificaciones = info.recibirNotificaciones ? 'si' : 'no';
      }
    }
  }

  async verificarConexion() {
    const isOnline = await this.networkService.isOnline();
    if (!isOnline) {
      const alert = await this.alertCtrl.create({
        header: 'Sin conexión',
        message: 'Estás desconectado. Algunos datos podrían no estar disponibles.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.obtenerDatosUsuario();
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
    if (!this.nombre || !this.apellidoPaterno || !this.apellidoMaterno ||
        !this.fechaNacimiento || !this.genero || !this.objetivo || !this.recibirNotificaciones) {
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

    const isOnline = await this.networkService.isOnline();

    if (isOnline) {
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
    } else {
      await this.dbTaskService.saveUserInfoOffline(infoActualizada);
      const toast = await this.toastController.create({
        message: 'Datos guardados offline. Se sincronizarán cuando haya conexión.',
        duration: 2000,
        color: 'medium',
        position: 'top'
      });
      await toast.present();
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
