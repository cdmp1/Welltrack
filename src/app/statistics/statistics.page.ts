import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DailyTrackingService } from '../services/daily-tracking.service';
import { DailyTracking } from '../models/daily-tracking.model';
import { StorageService } from '../services/storage.service';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: false
})
export class StatisticsPage implements OnInit {

  promedioSueno: number = 0;
  estadoAnimoFrecuente: string = '';
  diasEjercicio: number = 0;
  totalDias: number = 0;
  fraseMotivacional: string = '';
  userId!: number;
  ultimaFechaRegistrada: Date | null = null;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private dailyTrackingService: DailyTrackingService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    const storedUserId = await this.storageService.get<number>('userId');
    if (!storedUserId) {
      console.warn('No se encontró userId en storage, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }
    this.userId = storedUserId;
  }

  async ionViewWillEnter() {
    await this.calcularEstadisticas();
  }

  async actualizarResumen() {
    await this.calcularEstadisticas();
  }

  async calcularEstadisticas() {
    const registros: DailyTracking[] = await this.dailyTrackingService.getAllRecords(this.userId);

    const valoresSueno: number[] = [];
    const animos: string[] = [];
    let ejercicioContador = 0;

    for (const data of registros) {
      const horas = Number(data.horasSueno);
      if (!isNaN(horas) && horas >= 0 && horas <= 24) {
        valoresSueno.push(horas);
      }

      if (data.animo) {
        animos.push(data.animo.trim().toLowerCase());
      }

      if (data.ejercicio) {
        ejercicioContador++;
      }

      if (registros.length > 0) {
        const fechas = registros.map(r => new Date(r.fecha)).sort((a, b) => b.getTime() - a.getTime());
        this.ultimaFechaRegistrada = fechas[0];
      } else {
        this.ultimaFechaRegistrada = null;
      }

    }

    this.totalDias = registros.length;
    this.promedioSueno = valoresSueno.length > 0
      ? parseFloat((valoresSueno.reduce((a, b) => a + b) / valoresSueno.length).toFixed(1))
      : 0;

    this.estadoAnimoFrecuente = this.obtenerAnimoMasFrecuente(animos);
    this.diasEjercicio = ejercicioContador;

    this.fraseMotivacional = this.obtenerFrasePorAnimo(this.estadoAnimoFrecuente);
  }

  obtenerAnimoMasFrecuente(animos: string[]): string {
    const contador: { [key: string]: number } = {};
    for (const animo of animos) {
      contador[animo] = (contador[animo] || 0) + 1;
    }
    const ordenados = Object.entries(contador).sort((a, b) => b[1] - a[1]);
    return ordenados.length > 0 ? ordenados[0][0] : 'sin datos';
  }

  obtenerFrasePorAnimo(animo: string): string {
    const frasesPorAnimo: { [key: string]: string[] } = {
      feliz: ['Sigue brillando, tu alegría inspira.', 'Tu felicidad es contagiosa.', 'Cuando estás bien, todo mejora a tu alrededor.'],
      optimista: ['Tu actitud positiva abre caminos.', 'Sigue creyendo, lo mejor está por venir.', 'Con optimismo, todo se vuelve posible.'],
      energetico: ['Aprovecha tu energía para lograr tus objetivos.', 'Estás imparable, ¡sigue así.!', 'Tu vitalidad inspira a otros.'],
      tranquilo: ['La calma es una gran aliada.', 'Disfruta de la paz que has encontrado.', 'Estás en equilibrio, y eso se nota.'],
      neutral: ['Está bien tener días tranquilos.', 'No todo tiene que ser intenso. Valora la estabilidad.', 'Tu serenidad es valiosa.'],
      cansado: ['El descanso es necesario para estar bien.', 'El autocuidado no es egoísmo.', 'Tu cuerpo y mente necesitan pausas.'],
      estresado: ['Respira hondo. Puedes con esto.', 'Tómate un momento para ti. Te lo mereces.', 'No tienes que hacerlo todo hoy.'],
      ansioso: ['Paso a paso, respira. Todo estará bien.', 'No estás solo/a. Puedes con esto.', 'Eres más fuerte que tu ansiedad.'],
      triste: ['Está bien no estar bien. Mañana será mejor.', 'Te mereces tanto amor como el que das.', 'Eres fuerte, incluso cuando no lo sientes.'],
      'sin datos': ['Comienza hoy a registrar cómo te sientes.', 'Tu bienestar importa. Dale espacio en tu día.', 'Un pequeño cambio diario crea una gran diferencia.']
    };

    const clave = frasesPorAnimo.hasOwnProperty(animo) ? animo : 'sin datos';
    const frases = frasesPorAnimo[clave];
    const indice = Math.floor(Math.random() * frases.length);
    return frases[indice];
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro/a que quieres cerrar tu sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: async () => {
            await this.storageService.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

}
