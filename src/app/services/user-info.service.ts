import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserInfo } from '../models/user-info.model'; 
import { environment } from 'src/environments/environment'; 


@Injectable({ providedIn: 'root' })
export class UserInfoService {
  private base = `${environment.apiUrl}/userInfo`;

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  getUserInfoByUserId(userId: number): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(`${this.base}?userId=${userId}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  saveUserInfo(data: UserInfo): Observable<UserInfo> {
    return this.http.post<UserInfo>(this.base, data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateUserInfo(id: number, data: UserInfo): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.base}/${id}`, data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteUserInfo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, this.httpOptions)
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
