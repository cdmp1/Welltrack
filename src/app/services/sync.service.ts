import { Injectable } from '@angular/core';
import { DbTaskService } from './db-task.service';
import { UserInfoService } from './user-info.service';
import { DailyTrackingService } from './daily-tracking.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(
    private dbTask: DbTaskService,
    private userInfoService: UserInfoService,
    private dailyTrackingService: DailyTrackingService,
    private toastController: ToastController
  ) { }

  async syncPendingData(): Promise<void> {
    try {
      const pendingInfo = await this.dbTask.getPendingUserInfo();
      const pendingTracking = await this.dbTask.getPendingDailyTracking();

      let infoSincronizado = false;
      let trackingSincronizado = false;

      // 1. Sincronizar UserInfo
      for (const info of pendingInfo) {
        try {
          const existing = await new Promise<any[]>((resolve, reject) => {
            this.userInfoService.getUserInfoByUserId(info.userId).subscribe({
              next: resolve,
              error: reject
            });
          });

          const request$ = existing.length
            ? this.userInfoService.updateUserInfo(existing[0].id, info)
            : this.userInfoService.saveUserInfo(info);

          await new Promise<void>((resolve, reject) => {
            request$.subscribe({
              next: async () => {
                if (info.id) {
                  await this.dbTask.markUserInfoAsSynced(Number(info.id));
                }
                infoSincronizado = true;
                resolve();
              },
              error: reject
            });
          });

        } catch (err) {
          console.error('Error al sincronizar userInfo:', err);
        }
      }

      if (infoSincronizado) {
        await this.dbTask.clearSyncedUserInfo();
      }


      // 2. Sincronizar Seguimiento Diario
      for (const record of pendingTracking) {
        try {
          await this.dailyTrackingService.saveRecordOnline(record);
          await this.dbTask.markDailyTrackingAsSynced(Number(record.id));
          trackingSincronizado = true;
        } catch (err) {
          console.error('Error al sincronizar seguimiento diario:', err);
        }
      }

      if (trackingSincronizado) {
        await this.dbTask.clearSyncedDailyTracking();
      }


      // 3. Mostrar resultado visual
      if (infoSincronizado || trackingSincronizado) {
        await this.showToast('Datos sincronizados correctamente');
      } else {
        await this.showToast('No hay datos pendientes por sincronizar', 'medium');
      }

      console.log('Sincronización completada');

    } catch (e) {
      console.error('Error general en sincronización:', e);
      await this.showToast('Error al sincronizar datos', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'medium' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }

}
