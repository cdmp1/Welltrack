import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Storage } from '@ionic/storage-angular';

import { NetworkService } from '../services/network.service';
import { DbTaskService } from '../services/db-task.service';
import { SyncService } from '../services/sync.service'; 


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private userService: UserService,
    private storage: Storage,
    private networkService: NetworkService,     
    private dbTaskService: DbTaskService,
    private syncService: SyncService
  ) {}

  async ngOnInit() {
    this.registerForm = this.fb.group({
      usuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(8),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      nombre: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')
      ]],
      apellidoPaterno: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')
      ]],
      apellidoMaterno: ['', [
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

    await this.storage.create();
    
    const online = await this.networkService.isOnline();
    if (online) {
      await this.syncService.syncPendingData();
    }
  }

  async registrar(): Promise<void> {
    if (!this.registerForm.valid) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa correctamente todos los campos.',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    this.cargando = true;

    const datosUsuario: User = {
      usuario: this.registerForm.value.usuario,
      password: this.registerForm.value.password,
      nombre: this.registerForm.value.nombre,
      apellidop: this.registerForm.value.apellidoPaterno,
      apellidom: this.registerForm.value.apellidoMaterno,
      email: this.registerForm.value.email
    };

    const online = await this.networkService.isOnline();

    if (online) {
      // ONLINE: validar duplicados y registrar con API
      this.userService.checkIfUserExists(datosUsuario.usuario, datosUsuario.email).subscribe({
        next: async (usuarios: User[]) => {
          const existeUsuario = usuarios.some(u => u.usuario === datosUsuario.usuario);
          const existeEmail = usuarios.some(u => u.email === datosUsuario.email);

          if (existeUsuario || existeEmail) {
            this.cargando = false;
            let mensaje = 'Ya existe una cuenta con: ';
            if (existeUsuario) mensaje += 'ese nombre de usuario';
            if (existeUsuario && existeEmail) mensaje += ' y ';
            if (existeEmail) mensaje += 'ese correo electrónico';

            const toast = await this.toastController.create({
              message: mensaje,
              duration: 3000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
            return;
          }

          this.userService.register(datosUsuario).subscribe({
            next: async (nuevoUsuario) => {
              this.cargando = false;
              await this.storage.set('userId', nuevoUsuario.id);

              const toast = await this.toastController.create({
                message: '¡Usuario creado exitosamente!',
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();

              toast.onDidDismiss().then(() => {
                this.router.navigate(['/login']);
              });
            },
            error: async () => {
              this.cargando = false;
              const toast = await this.toastController.create({
                message: 'Error al registrar usuario',
                duration: 2000,
                color: 'danger',
                position: 'top'
              });
              await toast.present();
            }
          });
        },
        error: async () => {
          this.cargando = false;
          const toast = await this.toastController.create({
            message: 'Error al verificar datos del usuario.',
            duration: 2000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      });
    } else {
      // OFFLINE: guardar en SQLite y guardar ID temporal en Storage
      const tempId = await this.dbTaskService.saveUserOffline(datosUsuario);
      await this.storage.set('userId', tempId);

      this.cargando = false;

      const toast = await this.toastController.create({
        message: 'Usuario registrado sin conexión. Se sincronizará más adelante.',
        duration: 2500,
        color: 'medium',
        position: 'top'
      });
      await toast.present();

      toast.onDidDismiss().then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  
}
