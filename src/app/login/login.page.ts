import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Storage } from '@ionic/storage-angular';

import { NetworkService } from '../services/network.service';
import { DbTaskService } from '../services/db-task.service';
import { SyncService } from '../services/sync.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  
  usuario: string = '';
  password: string = '';
  loginError: boolean = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private userService: UserService,
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
  }

  async login() {
    const usuarioValido = /^[a-zA-Z0-9]{3,8}$/.test(this.usuario);
    const passwordValido = /^[0-9]{4}$/.test(this.password);

    if (!usuarioValido || !passwordValido) {
      this.loginError = true;
      return;
    }

    const online = await this.networkService.isOnline();

    if (online) {
      this.userService.login(this.usuario, this.password).subscribe(
        async (res: User[]) => {
          if (res.length > 0) {
            const datos: User = res[0];
            this.loginError = false;

            const yaExiste = await this.dbTaskService.getUserById(datos.id!);
            if (!yaExiste) {
              await this.dbTaskService.saveUserOffline(datos);
            }

            const loading = await this.loadingController.create({
              message: 'Iniciando sesión...',
              duration: 1000,
            });
            await loading.present();

            await this.storage.set('userId', datos.id);

            await loading.dismiss();
            this.router.navigate(['/home'], {
              state: {
                usuario: datos.usuario,
                password: datos.password,
                nombre: datos.nombre,
                apellidoPaterno: datos.apellidop,
                apellidoMaterno: datos.apellidom,
              }
            });
          } else {
            this.loginError = true;
          }
        },
        async (error) => {
          console.error('Error en login API', error);
          this.loginError = true;

          const toast = document.createElement('ion-toast');
          toast.message = 'Error al conectar con el servidor.';
          toast.duration = 2500;
          toast.color = 'danger';
          toast.position = 'top';
          document.body.appendChild(toast);
          await toast.present();
        }
      );
    } else {
      // OFFLINE
      const userOffline = await this.dbTaskService.getUserByCredenciales(this.usuario, this.password);

      if (userOffline) {
        this.loginError = false;

        const loading = await this.loadingController.create({
          message: 'Iniciando sesión offline...',
          duration: 1000,
        });
        await loading.present();

        await this.storage.set('userId', userOffline.id);

        await loading.dismiss();
        this.router.navigate(['/home'], {
          state: {
            usuario: userOffline.usuario,
            password: userOffline.password,
            nombre: userOffline.nombre,
            apellidoPaterno: userOffline.apellidop,
            apellidoMaterno: userOffline.apellidom
          }
        });
      } else {
        this.loginError = true;
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}