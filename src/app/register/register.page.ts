import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  cargando: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private toastController: ToastController) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      direccion: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  async registrar(): Promise<void> {
    if (this.registerForm.valid) {
      this.cargando = true;

      setTimeout(async () => {
        console.log('Datos del formulario:', this.registerForm.value);
        this.cargando = false;

        // Mostrar mensaje
        const toast = await this.toastController.create({
          message: '¡Usuario creado exitosamente!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });

        await toast.present();

        // Redirigir a Login
        toast.onDidDismiss().then(() => {
          this.router.navigate(['/login']);
        });

      }, 2000);
    } else {
      console.log('Formulario inválido');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
