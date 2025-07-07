import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserInfoService } from '../services/user-info.service';
import { UserService } from '../services/user.service';
import { NetworkService } from '../services/network.service';
import { DbTaskService } from '../services/db-task.service';
import { SyncService } from '../services/sync.service';
import { PhotoService } from '../services/photo.service';
import { StorageService } from '../services/storage.service';
import { PlatformConfigService } from '../services/platform-config.service';
import { Subscription } from 'rxjs';
import { User } from '../models/user.model';
import { UserInfo } from '../models/user-info.model';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnDestroy {

  user: User | null = null;
  userInfo: UserInfo = {
    userId: 0,
    genero: '',
    objetivo: '',
    fechaNacimiento: '',
    recibirNotificaciones: true
  };

  nombre: string = '';
  apellido: string = '';
  modoEdicion = false;
  imageSource: string | null = null;
  private networkSub!: Subscription;

  platform: string = '';

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toast: ToastController,
    private userService: UserService,
    private userInfoService: UserInfoService,
    private network: NetworkService,
    private db: DbTaskService,
    private sync: SyncService,
    private photoService: PhotoService,
    private storage: StorageService,
    private platformConfig: PlatformConfigService
  ) { }

  async ionViewWillEnter() {
    this.platform = this.platformConfig.getConfig().platform;
    
    // Sincronizar datos pendientes si está online
    if (await this.network.isOnline()) {
      await this.sync.syncPendingData();
    }

    // Obtener usuario almacenado localmente
    const storedUser = await this.storage.get<User>('user');
    if (!storedUser || !storedUser.username) {
      console.warn('Usuario inválido o no encontrado en storage:', storedUser);
      this.router.navigate(['/login']);
      return;
    }

    // Validar si usuario está bloqueado
    if (storedUser.estado === 'bloqueado') {
      const toast = await this.toast.create({
        message: 'Tu cuenta está bloqueada. Contacta con soporte.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();

      // Remover usuario almacenado y navegar a login
      await this.storage.remove('user');
      await Preferences.remove({ key: 'userId' });
      this.router.navigate(['/login']);
      return;
    }

    // Usuario válido y activo, cargar datos normalmente
    this.user = storedUser;
    this.nombre = storedUser.nombre || '';
    this.apellido = storedUser.apellido || '';
    this.userInfo.userId = storedUser.id ?? 0;
    await this.loadUserInfo();
    this.listenNetworkChanges();

    console.log('Usuario asignado correctamente:', this.user);
  }


  ngOnDestroy() {
    this.networkSub?.unsubscribe();
  }

  private listenNetworkChanges() {
    this.networkSub = this.network.getNetworkStatus().subscribe(async online => {
      if (!online) {
        const alert = await this.alertCtrl.create({
          header: 'Sin conexión',
          message: 'Estás desconectado. Algunos datos podrían no cargarse.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  private async loadUserInfo() {
    if (this.user === null) return;
    if (await this.network.isOnline()) {
      this.userInfoService.getUserInfoByUserId(this.user.id!).subscribe({
        next: (res) => {
          if (res.length) Object.assign(this.userInfo, res[0]);
        },
        error: () => console.error('Error al obtener datos de usuario')
      });
    } else {
      const offlineInfo = await this.db.getPendingUserInfo();
      const local = offlineInfo.find(i => i.userId === this.user!.id);
      if (local) Object.assign(this.userInfo, local);
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    if (this.user) {
      this.nombre = this.user.nombre || '';
      this.apellido = this.user.apellido || '';
    }
    this.loadUserInfo();
  }

  async limpiarCampos() {
    Object.assign(this.userInfo, {
      genero: '', objetivo: '', fechaNacimiento: new Date(), recibirNotificaciones: false
    });
    this.nombre = '';
    this.apellido = '';
    this.showToast('Campos limpiados.', 'medium');
  }

  async guardarDatos() {
    if (!this.nombre.trim() || !this.apellido.trim() || !this.userInfo.genero || !this.userInfo.objetivo || !this.userInfo.fechaNacimiento) {
      this.showToast('Completa todos los campos antes de guardar.', 'warning');
      return;
    }

    if (!this.user) {
      this.showToast('Usuario no válido para guardar datos.', 'danger');
      return;
    }

    const updatedUser: User = {
      ...this.user,
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim()
    };

    const updatedUserInfo: UserInfo = {
      ...this.userInfo,
      userId: this.user.id!,
      genero: this.userInfo.genero,
      objetivo: this.userInfo.objetivo,
      fechaNacimiento: this.userInfo.fechaNacimiento,
      recibirNotificaciones: this.userInfo.recibirNotificaciones
    };

    const online = await this.network.isOnline();

    if (online) {
      this.userService.updateUser(this.user.id!, updatedUser).subscribe({
        next: async (res) => {
          await this.storage.set('user', res);
          this.user = res;
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.showToast('Error al actualizar nombre y apellido', 'danger');
        }
      });

      const req$ = this.userInfo.id
        ? this.userInfoService.updateUserInfo(this.userInfo.id, updatedUserInfo)
        : this.userInfoService.saveUserInfo(updatedUserInfo);

      req$.subscribe({
        next: (res) => {
          this.userInfo = res;
          this.showToast('Datos guardados correctamente.', 'success');
          this.modoEdicion = false;
        },
        error: () => this.showToast('Error al guardar datos adicionales', 'danger')
      });

    } else {
      await this.db.saveUserInfoOffline(updatedUserInfo);
      this.showToast('Guardado offline. Se sincronizará.', 'medium');
    }
  }

  async tomarFoto() {
    const photo = await this.photoService.capturarFoto();
    this.imageSource = photo.webPath || null;
  }

  async seleccionarFoto() {
    const photo = await this.photoService.elegirDeGaleria();
    this.imageSource = photo.webPath || null;
  }


  irADailyTracking() {
    this.router.navigate(['/daily-tracking']);
  }


  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: async () => {
            await this.storage.remove('user');
            await Preferences.remove({ key: 'userId' });
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }


  mostrarDatos() {
    console.log('Usuario cargado:', JSON.stringify(this.user));
    console.log('Info:', this.userInfo);
  }

  private async showToast(msg: string, color: string) {
    const toast = await this.toast.create({ message: msg, duration: 2000, color, position: 'top' });
    await toast.present();
  }

}

