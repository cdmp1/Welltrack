import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment'; 


@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string): Observable<User[]> {
    const params = new HttpParams()
      .set('usuario', usuario)
      .set('password', password);
    return this.http.get<User[]>(this.base, { params })
      .pipe(catchError(this.handleError));
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(this.base, user, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  checkIfUserExists(usuario: string, email: string): Observable<User[]> {
    const params = new HttpParams()
      .set('usuario', usuario)
      .set('email', email);
    return this.http.get<User[]>(this.base, { params })
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: number, data: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  lista(): Observable<User[]> {
    return this.http.get<User[]>(this.base)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición HTTP:', error);
    if (error.error instanceof ErrorEvent) {
      // Error del lado cliente / red
      return throwError(() => new Error('Ocurrió un error de red. Por favor, revisa tu conexión.'));
    } else {
      // Error del lado servidor
      switch (error.status) {
        case 0:
          return throwError(() => new Error('No se pudo conectar con el servidor. Intenta más tarde.'));
        case 400:
          return throwError(() => new Error('La solicitud es inválida. Por favor, verifica los datos.'));
        case 401:
          return throwError(() => new Error('No autorizado. Por favor, inicia sesión nuevamente.'));
        case 404:
          return throwError(() => new Error('Recurso no encontrado.'));
        case 500:
          return throwError(() => new Error('Error interno del servidor. Intenta más tarde.'));
        default:
          return throwError(() => new Error('Error en la comunicación con el servidor, inténtalo más tarde.'));
      }
    }
  }

}

