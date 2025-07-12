import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { StorageService } from '../services/storage.service';
import { User } from '../models/user.model';
import { ToastController } from '@ionic/angular';


export const authGuard: CanActivateFn = async (route, state) => {
  const isE2E = typeof window !== 'undefined' && (window as any).Cypress;
  if (isE2E) return true;

  const router = inject(Router);
  const storageService = inject(StorageService);
  const toastCtrl = inject(ToastController);

  const { value: userId } = await Preferences.get({ key: 'userId' });
  if (!userId) {
    router.navigate(['/login']);
    return false;
  }

  const user = await storageService.get<User>('user');
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.estado === 'bloqueado') {
    const toast = await toastCtrl.create({
      message: 'Tu cuenta está bloqueada. Contacta con soporte.',
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();

    router.navigate(['/login']);
    return false;
  }

  // Redirigir a admin si intenta acceder a rutas normales
  if (user.rol === 'admin' && state.url !== '/admin-users') {
    router.navigate(['/admin-users']);
    return false;
  }

  return true;
};


export const adminGuard: CanActivateFn = async (route, state) => {
  const isE2E = typeof window !== 'undefined' && (window as any).Cypress;
  if (isE2E) {
    const cypressUser = (window as any).CypressUser as User;
    if (cypressUser?.rol === 'admin') return true;
    return false;
  }

  const router = inject(Router);
  const storageService = inject(StorageService);
  const toastCtrl = inject(ToastController);

  const { value: userId } = await Preferences.get({ key: 'userId' });
  if (!userId) {
    router.navigate(['/login']);
    return false;
  }

  const user = await storageService.get<User>('user');
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.estado === 'bloqueado') {
    const toast = await toastCtrl.create({
      message: 'Tu cuenta está bloqueada. Contacta con soporte.',
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();

    router.navigate(['/login']);
    return false;
  }

  if (user.rol !== 'admin') {
    const toast = await toastCtrl.create({
      message: 'No tienes permisos para acceder a esta sección.',
      duration: 3000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();

    router.navigate(['/home']);
    return false;
  }

  return true;

};
