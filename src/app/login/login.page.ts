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

  constructor(private router: Router, private loadingController: LoadingController) {}

  login() {
    // Validaciones
    const usuarioValido = /^[a-zA-Z0-9]{3,8}$/.test(this.usuario);
    const passwordValido = /^[0-9]{4}$/.test(this.password);

    if (!usuarioValido) {
      alert('El nombre de usuario debe tener entre 3 y 8 caracteres alfanuméricos.');
      return;
    }

    if (!passwordValido) {
      alert('La contraseña debe ser un número de 4 dígitos.');
      return;
    }

    // Redirección a Home y pasar datos
    this.router.navigate(['/home'], {
      state: { usuario: this.usuario }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}