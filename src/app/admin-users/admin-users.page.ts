import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit {

  users: User[] = [];

  newUser: Partial<User> = {
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  };

  isLoading = false;
  mostrarFormulario = false;

  constructor(
    private userService: UserService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.lista().subscribe({
      next: users => {
        this.users = users;
        this.isLoading = false;
      },
      error: async err => {
        this.isLoading = false;
        this.showToast('Error cargando usuarios');
        console.error(err);
      }
    });
  }

  async addUser() {
    if (!this.newUser.username || !this.newUser.nombre || !this.newUser.apellido || !this.newUser.email) {
      this.showToast('Completa todos los campos para agregar usuario');
      return;
    }

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.showToast('Ingresa un correo electrónico válido');
      return;
    }

    if (!this.newUser.password) {
      this.showToast('La contraseña es obligatoria');
      return;
    }

    this.isLoading = true;
    this.userService.register(this.newUser as User).subscribe({
      next: () => {
        this.showToast('Usuario agregado');
        this.newUser = { username: '', nombre: '', apellido: '', email: '', password: '' };
        this.loadUsers();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.showToast('Error al agregar usuario');
        console.error(err);
      }
    });
  }

  async deleteUser(id: number) {
    const confirm = window.confirm('¿Seguro que quieres eliminar este usuario?');
    if (!confirm) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.showToast('Usuario eliminado');
        this.loadUsers();
      },
      error: err => {
        this.showToast('Error al eliminar usuario');
        console.error(err);
      }
    });
  }

  cambiarEstado(userId: number, nuevoEstado: 'activo' | 'bloqueado') {
    this.userService.updateUserEstado(userId, nuevoEstado).subscribe({
      next: () => {
        this.showToast(`Estado actualizado a "${nuevoEstado}"`);
        this.loadUsers();
      },
      error: err => {
        this.showToast('Error al actualizar estado');
        console.error(err);
      }
    });
  }

  logout() {
    Preferences.remove({ key: 'userId' });
    Preferences.remove({ key: 'user' });
    this.router.navigateByUrl('/login');
  }

  toggleAgregarUsuario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

}
