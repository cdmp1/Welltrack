import { Injectable } from '@angular/core';
import { DbTaskService } from './db-task.service';
import { NetworkService } from './network.service';
import { DailyTracking } from '../models/daily-tracking.model';


@Injectable({
  providedIn: 'root'
})
export class DailyTrackingService {

  constructor(
    private dbTaskService: DbTaskService,
    private networkService: NetworkService
  ) {}

// Guarda un registro de seguimiento diario. Intenta guardar online si hay conexión
  async saveRecord(record: DailyTracking): Promise<void> {

    const isOnline = await this.networkService.isOnline();

    if (isOnline) {
      try {
        // Petición a API REST 
        // await this.apiService.post(record); 

        record.sincronizado = true;
        await this.dbTaskService.saveDailyTracking(record);
      } catch (error) {
        console.warn('Error al guardar online. Guardando offline...', error);
        record.sincronizado = false;
        await this.dbTaskService.saveDailyTracking(record);
      }
    } else {
      record.sincronizado = false;
      await this.dbTaskService.saveDailyTracking(record);
    }
  }

  // Guarda directamente como sincronizado (usado por SyncService cuando ya se subió el dato)
  async saveRecordOnline(record: DailyTracking): Promise<void> {
    record.sincronizado = true;
    await this.dbTaskService.saveDailyTracking(record);
  }

  // Guarda un registro como pendiente de sincronización
  async saveRecordOffline(record: DailyTracking): Promise<void> {
    record.sincronizado = false;
    await this.dbTaskService.saveDailyTracking(record);
  }

  // Devuelve un registro por fecha
  async getRecordByDate(userId: number, fecha: string): Promise<DailyTracking | null> {
    return this.dbTaskService.getDailyTrackingByDate(userId, fecha);
  }

  // Devuelve todos los registros de un usuario
  async getAllRecords(userId: number): Promise<DailyTracking[]> {
    return this.dbTaskService.getAllDailyTracking(userId);
  }

  // Devuelve los registros que aún no se han sincronizado
  async getPendingRecords(): Promise<DailyTracking[]> {
    return this.dbTaskService.getPendingDailyTracking();
  }

  // Marca un registro como sincronizado
  async markAsSynced(id: number): Promise<void> {
    await this.dbTaskService.markDailyTrackingAsSynced(id);
  }

}
