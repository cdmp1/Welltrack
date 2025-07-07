import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { PlatformConfigService } from './platform-config.service';


@Injectable({ providedIn: 'root' })
export class UserService {
  private base: string;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private platformConfig: PlatformConfigService
  ) {
    this.base = `${this.platformConfig.getConfig().apiUrl}/users`;
  }

  // Login por username (GET)
  login(username: string): Observable<User[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<User[]>(this.base, { params })
      .pipe(catchError(this.handleError));
  }

  // Registro (POST)
  register(user: User): Observable<User> {
    return this.http.post<User>(this.base, user, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Verificar existencia (GET)
  checkIfUserExists(username: string, email: string): Observable<User[]> {
    const params = new HttpParams()
      .set('username', username)
      .set('email', email);
    return this.http.get<User[]>(this.base, { params })
      .pipe(catchError(this.handleError));
  }

  // Eliminar usuario (DELETE)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Actualizar usuario completo (PUT)
  updateUser(id: number, data: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Listar todos los usuarios (GET)
  lista(): Observable<User[]> {
    return this.http.get<User[]>(this.base)
      .pipe(catchError(this.handleError));
  }

  // Actualizar solo el estado del usuario (PATCH)
  updateUserEstado(id: number, estado: 'activo' | 'bloqueado'): Observable<User> {
    return this.http.patch<User>(
      `${this.base}/${id}`, 
      { estado }, 
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Manejo genérico de errores HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición HTTP:', error);
    if (error.error instanceof ErrorEvent) {
      return throwError(() => new Error('Ocurrió un error de red. Revisa tu conexión.'));
    } else {
      switch (error.status) {
        case 0: return throwError(() => new Error('No se pudo conectar con el servidor.'));
        case 400: return throwError(() => new Error('La solicitud es inválida.'));
        case 401: return throwError(() => new Error('No autorizado. Por favor, inicia sesión.'));
        case 404: return throwError(() => new Error('Recurso no encontrado.'));
        case 500: return throwError(() => new Error('Error interno del servidor.'));
        default: return throwError(() => new Error('Error inesperado del servidor.'));
      }
    }
  }

}
