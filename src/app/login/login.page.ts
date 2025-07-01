import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { NetworkService } from '../services/network.service';
import { User } from '../models/user.model';
import { finalize } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: UserService,
    private storageService: StorageService,
    private networkService: NetworkService
  ) { }

  async ngOnInit() {
    const usuarioGuardado = await this.storageService.get<User>('user');
    if (usuarioGuardado && usuarioGuardado.id !== undefined) {
      await Preferences.set({ key: 'userId', value: usuarioGuardado.id.toString() });
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      await this.storageService.remove('user');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  formularioValido(): boolean {
    const usernameValido = /^[a-zA-Z0-9]{3,8}$/.test(this.username);
    const passwordValido = /^[0-9]{4}$/.test(this.password);
    return usernameValido && passwordValido;
  }

  async doLogin() {
    const usernameLimpio = this.username.trim();
    const passwordLimpio = this.password.trim();

    const usernameValido = /^[a-zA-Z0-9]{3,8}$/.test(usernameLimpio);
    const passwordValido = /^[0-9]{4}$/.test(passwordLimpio);

    if (!usernameValido || !passwordValido) {
      return this.mostrarToast('Usuario o contraseña inválidos.', 'danger');
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({ message: 'Iniciando sesión...' });
    await loading.present();

    const online = await this.networkService.isOnline();

    if (online) {
      this.userService.login(usernameLimpio).pipe(
        finalize(() => {
          this.isLoading = false;
          loading.dismiss();
        })
      ).subscribe(
        async (res) => {
          if (!res) {
            this.mostrarToast('No se recibió respuesta del servidor.', 'danger');
            return;
          }

          console.log('Respuesta de login:', res);
          const user = res.find(u => u.password === passwordLimpio);
          if (user && user.id !== undefined) {
            if (user.estado === 'bloqueado') {
              this.mostrarToast('Tu cuenta está bloqueada. Contacta con soporte.', 'danger');
              this.username = '';
              this.password = '';
              return;
            }

            await this.storageService.set('user', user);
            await Preferences.set({ key: 'userId', value: user.id.toString() });

            if (user.rol === 'admin') {
              this.router.navigateByUrl('/admin-users', { replaceUrl: true });
            } else {
              this.router.navigateByUrl('/home', { replaceUrl: true });
            }
          } else {
            this.mostrarToast('Credenciales incorrectas.', 'danger');
            this.password = '';
          }
        },
        (error) => {
          console.error('Error login:', error);
          this.mostrarToast('Error al conectar con el servidor.', 'danger');
        }
      );
    } else {
      // Modo offline
      const user = await this.storageService.get<User>('user');
      loading.dismiss();
      this.isLoading = false;

      if (user && user.username === usernameLimpio && user.password === passwordLimpio && user.id !== undefined) {
        if (user.estado === 'bloqueado') {
          this.mostrarToast('Tu cuenta está bloqueada. Contacta con soporte.', 'danger');
          this.username = '';
          this.password = '';
          return;
        }
        this.mostrarToast(`Bienvenido de nuevo, ${user.nombre}`, 'success');
        await Preferences.set({ key: 'userId', value: user.id.toString() });
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.mostrarToast('Primero inicia sesión con conexión para usar la app sin internet.', 'warning');
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

}
