import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  // Datos recibidos del Login
  usuario: string = '';
  password: string = '';

  // Datos del formulario adicional
  nombre: string = '';
  apellido: string = '';
  nivelEducacion: string = '';
  fechaNacimiento: Date | null = null;

  // Referencias a los inputs para animación
  @ViewChild('inputNombre') inputNombre!: ElementRef;
  @ViewChild('inputApellido') inputApellido!: ElementRef;

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state) {
      this.usuario = state['usuario'];
      this.password = state['password'];
    } else {
      console.warn('No se recibieron datos desde Login');
    }
  }

  limpiarCampos() {
    this.nombre = '';
    this.apellido = '';
    this.nivelEducacion = '';
    this.fechaNacimiento = null;

    this.animarInput(this.inputNombre);
    this.animarInput(this.inputApellido);
  }

  animarInput(input: ElementRef) {
    const nativeElement = input.nativeElement;
    nativeElement.classList.add('shake');

    setTimeout(() => {
      nativeElement.classList.remove('shake');
    }, 1000);
  }

  async mostrarDatos() {
    const alert = await this.alertCtrl.create({
      header: 'Usuario',
      message: `Su nombre es ${this.nombre} ${this.apellido}`,
      buttons: ['Listo']
    });

    await alert.present();
  }


async logOut() {
  const alert = await this.alertCtrl.create({
    header: 'Cerrar sesión',
    message: '¿Estás seguro que quieres cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Sí',
        handler: () => {
          this.router.navigate(['/login']);
        }
      }
    ]
  });
  await alert.present();
}

}
