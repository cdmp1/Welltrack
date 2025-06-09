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
}


async registrar(): Promise<void> {
  if (this.registerForm.valid) {
    this.cargando = true;

    setTimeout(async () => {
      const datosUsuario = this.registerForm.value;

      // Guardar datos en localStorage
      localStorage.setItem('datosUsuario', JSON.stringify({
        usuario: datosUsuario.usuario,
        password: datosUsuario.password,
        nombre: datosUsuario.nombre,
        apellidop: datosUsuario.apellidoPaterno,
        apellidom: datosUsuario.apellidoMaterno,
        email: datosUsuario.email
      }));

      console.log('Datos del formulario guardados:', datosUsuario);
      this.cargando = false;

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

    }, 2000);
  } else {
    console.log('Formulario inválido');
  }
}


  goToLogin() {
    this.router.navigate(['/login']);
  }
}
