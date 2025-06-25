import { Injectable } from '@angular/core';
import { DbTaskService } from './db-task.service';
import { UserService } from './user.service';
import { UserInfoService } from './user-info.service';
import { DailyTrackingService } from './daily-tracking.service';


@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(
    private dbTask: DbTaskService,
    private userService: UserService,
    private userInfoService: UserInfoService,
    private dailyTrackingService: DailyTrackingService
  ) {}

  async syncPendingData(): Promise<void> {
    try {
      // 1. Sincronizar usuarios pendientes
      const pendingUsers = await this.dbTask.getPendingUsers();

      for (const user of pendingUsers) {
        try {
          await new Promise<void>((resolve, reject) => {
            this.userService.register(user).subscribe({
              next: async (createdUser) => {
                if (createdUser?.id) {
                  const tempId = user.id!;
                  
                  await this.dbTask.updateUserId(tempId, createdUser.id);
                  await this.dbTask.updateUserInfoUserId(tempId, createdUser.id);
                }
                resolve();
              },
              error: reject
            });
          });
        } catch (err) {
          console.error('Error al sincronizar usuario:', user.usuario, err);
        }
      }

      // 2. Sincronizar información adicional pendiente
      const pendingInfo = await this.dbTask.getPendingUserInfo();

      for (const info of pendingInfo) {
        try {
          await new Promise<void>((resolve, reject) => {
            this.userInfoService.saveUserInfo(info).subscribe({
              next: async (savedInfo) => {
                if (info.id) {
                  await this.dbTask.markUserInfoAsSynced(info.id);
                }
                resolve();
              },
              error: reject
            });
          });
        } catch (err) {
          console.error('Error al sincronizar userInfo de userId', info.userId, err);
        }
      }

      // 3. Sincronizar seguimientos diarios pendientes
      const pendingTracking = await this.dbTask.getPendingDailyTracking();

      for (const record of pendingTracking) {
        try {
          await this.dailyTrackingService.saveRecordOnline(record);
          await this.dbTask.markDailyTrackingAsSynced(record.id!);
        } catch (err: any) {
          console.error('Error al guardar seguimiento diario de userId:', record.userId, err);
        }
      }

      console.log('Sincronización completada');

    } catch (e) {
      console.error('Error general en sincronización:', e);
    }
  }
}
