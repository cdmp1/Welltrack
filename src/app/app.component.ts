import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import { StorageService } from './services/storage.service';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private storage: StorageService,
    private menu: MenuController 
  ) { }

async logOut() {
  await this.menu.close(); 

  const alert = await this.alertCtrl.create({
    header: 'Cerrar sesión',
    message: '¿Seguro que deseas cerrar sesión?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Sí', role: 'confirm' }
    ]
  });
  await alert.present();

  const { role } = await alert.onDidDismiss();
  if (role === 'confirm') {
    await this.storage.remove('user');
    await Preferences.remove({ key: 'userId' });
    this.router.navigate(['/login']);
  }
}

}
