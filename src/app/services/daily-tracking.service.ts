import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DbTaskService } from './db-task.service';
import { NetworkService } from './network.service';
import { DailyTracking } from '../models/daily-tracking.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {
  private baseUrl = `${environment.apiUrl}/dailyTracking`;

  constructor(
    private http: HttpClient,
    private dbTaskService: DbTaskService,
    private networkService: NetworkService
  ) { }

  // Guarda un registro, intenta online, sino guarda offline
  async saveRecord(record: DailyTracking): Promise<void> {
    const isOnline = await this.networkService.isOnline();

    if (isOnline) {
      try {
        const existing = await this.getRecordByDate(record.userId, record.fecha);

        if (existing && existing.id) {
          console.log('Actualizando seguimiento online, id:', existing.id);
          await this.http.put(`${this.baseUrl}/${existing.id}`, record).toPromise();
        } else {
          console.log('Creando nuevo seguimiento online');
          await this.http.post(this.baseUrl, record).toPromise();
        }

        record.sincronizado = true;
      } catch (error) {
        console.warn('Error al guardar online. Guardando offline...', error);
        record.sincronizado = false;
      }
    } else {
      record.sincronizado = false;
    }

    await this.dbTaskService.saveDailyTracking(record);
  }

  // Guarda registro marcándolo como sincronizado (usado en sincronización)
  async saveRecordOnline(record: DailyTracking): Promise<void> {
    const existing = await this.getRecordByDate(record.userId, record.fecha);

    if (existing && existing.id) {
      console.log('Actualizando seguimiento desde sincronización, id:', existing.id);
      await this.http.put(`${this.baseUrl}/${existing.id}`, record).toPromise();
    } else {
      console.log('Creando nuevo seguimiento desde sincronización');
      await this.http.post(this.baseUrl, record).toPromise();
    }

    record.sincronizado = true;
    await this.dbTaskService.saveDailyTracking(record);
  }

  // Guarda registro offline
  async saveRecordOffline(record: DailyTracking): Promise<void> {
    record.sincronizado = false;
    await this.dbTaskService.saveDailyTracking(record);
  }

  // Obtiene registro por fecha, intenta online, sino local
  async getRecordByDate(userId: number, fecha: string): Promise<DailyTracking | null> {
    const isOnline = await this.networkService.isOnline();

    if (isOnline) {
      try {
        const result = await this.http.get<DailyTracking[]>(`${this.baseUrl}?userId=${userId}&fecha=${fecha}`).toPromise();

        if (result && result.length > 0) {
          return result[0];
        } else {
          return null;
        }
      } catch (error) {
        console.warn('Error al obtener registro online:', error);
        return null;
      }
    } else {
      return await this.dbTaskService.getDailyTrackingByDate(userId, fecha);
    }
  }

  async getAllRecords(userId: number): Promise<DailyTracking[]> {
    return this.dbTaskService.getAllDailyTracking(userId);
  }

  async getPendingRecords(): Promise<DailyTracking[]> {
    return this.dbTaskService.getPendingDailyTracking();
  }

  async markAsSynced(id: number): Promise<void> {
    await this.dbTaskService.markDailyTrackingAsSynced(id);
  }

}
