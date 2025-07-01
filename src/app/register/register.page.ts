import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { StorageService } from '../services/storage.service';
import { NetworkService } from '../services/network.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private userService: UserService,
    private storageService: StorageService,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(8),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      nombre: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')
      ]],
      apellido: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{4}$')
      ]]
    });
  }

  async registrar(): Promise<void> {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      this.mostrarToast('Por favor, completa correctamente todos los campos.', 'warning');
      return;
    }

    const online = await this.networkService.isOnline();
    if (!online) {
      this.mostrarToast('Debes estar conectado para poder registrarte.', 'warning');
      return;
    }

    this.cargando = true;

    const nombre = this.registerForm.value.nombre.trim();
    const apellido = this.registerForm.value.apellido.trim();

    const datosUsuario: User = {
      username: this.registerForm.value.username.trim(),
      password: this.registerForm.value.password.trim(),
      nombre,
      apellido,
      email: this.registerForm.value.email.trim(),
      estado: 'activo' 
    };

    this.userService.checkIfUserExists(datosUsuario.username!, datosUsuario.email!).subscribe({
      next: async (usuarios: User[]) => {
        const existeUsuario = usuarios.some(u => u.username === datosUsuario.username);
        const existeEmail = usuarios.some(u => u.email === datosUsuario.email);

        if (existeUsuario || existeEmail) {
          this.cargando = false;
          let mensaje = 'Ya existe una cuenta con ';
          if (existeUsuario && existeEmail) {
            mensaje += 'ese nombre de usuario y correo electrónico';
          } else if (existeUsuario) {
            mensaje += 'ese nombre de usuario';
          } else {
            mensaje += 'ese correo electrónico';
          }

          this.mostrarToast(mensaje, 'danger');
          return;
        }

        this.userService.register(datosUsuario).subscribe({
          next: async (nuevoUsuario) => {
            await this.storageService.set('user', nuevoUsuario);
            this.cargando = false;
            this.registerForm.reset();

            const toast = await this.toastController.create({
              message: '¡Usuario creado exitosamente!',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();

            toast.onDidDismiss().then(() => {
              this.router.navigateByUrl('/login', { replaceUrl: true });
            });
          },
          error: async () => {
            this.cargando = false;
            this.mostrarToast('Error al registrar usuario', 'danger');
          }
        });
      },
      error: async () => {
        this.cargando = false;
        this.mostrarToast('Error al verificar datos del usuario.', 'danger');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

}
