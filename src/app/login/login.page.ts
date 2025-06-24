import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  usuario: string = '';
  password: string = '';
  loginError: boolean = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private userService: UserService
  ) {}


  login() {
    const usuarioValido = /^[a-zA-Z0-9]{3,8}$/.test(this.usuario);
    const passwordValido = /^[0-9]{4}$/.test(this.password);

    if (!usuarioValido || !passwordValido) {
      this.loginError = true;
      return;
    }

    this.userService.login(this.usuario, this.password).subscribe(async (res: User[]) => {
      if (res.length > 0) {
        const datos: User = res[0]; 

        this.loginError = false;

        const loading = await this.loadingController.create({
          message: 'Iniciando sesión...',
          duration: 1000,
        });
        await loading.present();

        localStorage.setItem('userId', datos.id?.toString() || '');

        this.router.navigate(['/home'], {
          state: {
            usuario: datos.usuario, 
            password: datos.password,
            nombre: datos.nombre,
            apellidoPaterno: datos.apellidop,
            apellidoMaterno: datos.apellidom
          }
        });
      } else {
        this.loginError = true;
      }
    });
  }

  
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
