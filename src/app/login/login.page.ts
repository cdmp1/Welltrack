import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


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

  constructor(private router: Router, private loadingController: LoadingController) { }

login() {
  const usuarioValido = /^[a-zA-Z0-9]{3,8}$/.test(this.usuario);
  const passwordValido = /^[0-9]{4}$/.test(this.password);

  if (!usuarioValido || !passwordValido) {
    this.loginError = true;
    return;
  }

  const datosGuardados = localStorage.getItem('datosUsuario');

  if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);

    if (this.usuario === datos.usuario && this.password === datos.password) {
      this.loginError = false;
      this.router.navigate(['/home'], {
        state: {
          usuario: this.usuario,
          password: this.password,
          nombre: datos.nombre,
          apellidoPaterno: datos.apellidop,
          apellidoMaterno: datos.apellidom
        }
      });
      return;
    }
  }

  this.loginError = true;
}

  // Redirección a Register 
  goToRegister() {
    this.router.navigate(['/register']);
  }
}