import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';


@Component({
    selector: 'app-user-list-test',
    template: `
    <h2>Prueba listado usuarios</h2>
    <button (click)="listar()">Listar usuarios</button>
    <ul>
      <li *ngFor="let u of usuarios">
        {{ u.usuario }} ({{ u.email }})
        <button (click)="borrar(u.id)">Borrar</button>
        <button (click)="actualizar(u)">Actualizar (demo)</button>
      </li>
    </ul>
  `,
  standalone: false
})
export class UserListTestComponent implements OnInit {
    usuarios: User[] = [];

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.listar();
    }

    listar() {
        this.userService.lista().subscribe({
            next: (users) => {
                this.usuarios = users;
                console.log('Usuarios listados:', users);
            },
            error: (err: any) => console.error('Error listar usuarios', err)
        });
    }

    borrar(id?: number) {
        if (!id) return console.warn('No ID para borrar');
        this.userService.deleteUser(id).subscribe({
            next: () => {
                console.log(`Usuario ${id} borrado`);
                this.listar();
            },
            error: (err: any) => console.error('Error borrar usuario', err)
        });
    }

    actualizar(user: User) {
        if (!user.id) return console.warn('Usuario sin ID');
        const actualizado = { ...user, nombre: user.nombre + ' (editado)' };
        this.userService.updateUser(user.id, actualizado).subscribe({
            next: (res) => {
                console.log('Usuario actualizado', res);
                this.listar();
            },
            error: (err: any) => console.error('Error actualizar usuario', err)
        });
    }

}
