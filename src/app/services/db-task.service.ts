import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Platform } from '@ionic/angular';
import { UserInfo } from '../models/user-info.model';
import { DailyTracking } from '../models/daily-tracking.model';


@Injectable({
  providedIn: 'root'
})
export class DbTaskService {

  private sqliteConn!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isReady = false;

  constructor(private platform: Platform) {
    this.init();
  }

  async init() {
    try {
      await this.platform.ready();

      if (!this.platform.is('capacitor')) {
        console.warn('SQLite solo disponible en plataforma nativa');
        return;
      }

      this.sqliteConn = new SQLiteConnection(CapacitorSQLite);

      // Intentar recuperar conexión existente
      try {
        this.db = await this.sqliteConn.retrieveConnection('welltrackdb', false);
        if (!this.db) {
          throw new Error('No existe la conexión, crear una nueva');
        }
      } catch {
        this.db = await this.sqliteConn.createConnection(
          'welltrackdb',
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();

      await this.db.execute(`
      CREATE TABLE IF NOT EXISTS user_info_offline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        genero TEXT,
        objetivo TEXT,
        fechaNacimiento TEXT,
        recibirNotificaciones INTEGER,
        sincronizado INTEGER DEFAULT 0
      )
    `);

      await this.db.execute(`
      CREATE TABLE IF NOT EXISTS daily_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        fecha TEXT,
        sueno TEXT,
        horasSueno INTEGER,
        animo TEXT,
        ejercicio INTEGER,
        notas TEXT,
        sincronizado INTEGER DEFAULT 0
      )
    `);

      this.isReady = true;
    } catch (e) {
      console.error('Error inicializando DB:', e);
      throw e;
    }
  }


  // USER INFO OFFLINE
  async saveUserInfoOffline(userInfo: UserInfo): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      const fechaIso = new Date(userInfo.fechaNacimiento).toISOString();

      await this.db.run(
        `INSERT INTO user_info_offline (userId, genero, objetivo, fechaNacimiento, recibirNotificaciones, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userInfo.userId, userInfo.genero, userInfo.objetivo, fechaIso, userInfo.recibirNotificaciones ? 1 : 0, 0]
      );
    } catch (e) {
      console.error('Error saveUserInfoOffline:', e);
      throw e;
    }
  }

  async getPendingUserInfo(): Promise<UserInfo[]> {
    try {
      if (!this.isReady) await this.init();
      const result = await this.db.query(`SELECT * FROM user_info_offline WHERE sincronizado = 0`);
      return result.values?.map((row: any) => ({
        id: Number(row.id),
        userId: row.userId,
        genero: row.genero,
        objetivo: row.objetivo,
        fechaNacimiento: new Date(row.fechaNacimiento),
        recibirNotificaciones: row.recibirNotificaciones === 1
      })) ?? [];
    } catch (e) {
      console.error('Error getPendingUserInfo:', e);
      throw e;
    }
  }

  async markUserInfoAsSynced(id: number): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      await this.db.run(`UPDATE user_info_offline SET sincronizado = 1 WHERE id = ?`, [id]);
    } catch (e) {
      console.error('Error markUserInfoAsSynced:', e);
      throw e;
    }
  }

  // DAILY TRACKING
  async saveDailyTracking(record: DailyTracking): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      await this.db.run(
        `INSERT OR REPLACE INTO daily_tracking (
          id, userId, fecha, sueno, horasSueno, animo, ejercicio, notas, sincronizado
        ) VALUES (
          COALESCE((SELECT id FROM daily_tracking WHERE userId = ? AND fecha = ?), NULL),
          ?, ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          record.userId, record.fecha,
          record.userId, record.fecha, record.sueno,
          record.horasSueno, record.animo,
          record.ejercicio ? 1 : 0, record.notas,
          record.sincronizado ? 1 : 0
        ]
      );
    } catch (e) {
      console.error('Error saveDailyTracking:', e);
      throw e;
    }
  }

  async getDailyTrackingByDate(userId: number, fecha: string): Promise<DailyTracking | null> {
    try {
      if (!this.isReady) await this.init();
      const res = await this.db.query(`SELECT * FROM daily_tracking WHERE userId = ? AND fecha = ?`, [userId, fecha]);
      const row = res.values?.[0];
      return row ? {
        id: row.id,
        userId: row.userId,
        fecha: row.fecha,
        sueno: row.sueno,
        horasSueno: row.horasSueno,
        animo: row.animo,
        ejercicio: row.ejercicio === 1,
        notas: row.notas,
        sincronizado: row.sincronizado === 1
      } : null;
    } catch (e) {
      console.error('Error getDailyTrackingByDate:', e);
      throw e;
    }
  }

  async getAllDailyTracking(userId: number): Promise<DailyTracking[]> {
    try {
      if (!this.isReady) await this.init();
      const res = await this.db.query(`SELECT * FROM daily_tracking WHERE userId = ? ORDER BY fecha DESC`, [userId]);
      return res.values?.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        fecha: row.fecha,
        sueno: row.sueno,
        horasSueno: row.horasSueno,
        animo: row.animo,
        ejercicio: row.ejercicio === 1,
        notas: row.notas,
        sincronizado: row.sincronizado === 1
      })) ?? [];
    } catch (e) {
      console.error('Error getAllDailyTracking:', e);
      throw e;
    }
  }

  async getPendingDailyTracking(): Promise<DailyTracking[]> {
    try {
      if (!this.isReady) await this.init();
      const res = await this.db.query(`SELECT * FROM daily_tracking WHERE sincronizado = 0`);
      return res.values?.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        fecha: row.fecha,
        sueno: row.sueno,
        horasSueno: row.horasSueno,
        animo: row.animo,
        ejercicio: row.ejercicio === 1,
        notas: row.notas,
        sincronizado: false
      })) ?? [];
    } catch (e) {
      console.error('Error getPendingDailyTracking:', e);
      throw e;
    }
  }

  async markDailyTrackingAsSynced(id: number): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      await this.db.run(`UPDATE daily_tracking SET sincronizado = 1 WHERE id = ?`, [id]);
    } catch (e) {
      console.error('Error markDailyTrackingAsSynced:', e);
      throw e;
    }
  }

  async clearSyncedDailyTracking(): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      await this.db.run(`DELETE FROM daily_tracking WHERE sincronizado = 1`);
    } catch (e) {
      console.error('Error clearSyncedDailyTracking:', e);
      throw e;
    }
  }

  async clearSyncedUserInfo(): Promise<void> {
    try {
      if (!this.isReady) await this.init();
      await this.db.run(`DELETE FROM user_info_offline WHERE sincronizado = 1`);
    } catch (e) {
      console.error('Error clearSyncedUserInfo:', e);
      throw e;
    }
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.db) {
        await this.db.close();
        await this.sqliteConn.closeConnection('welltrackdb', false);
        this.isReady = false;
      }
    } catch (e) {
      console.error('Error closing DB connection:', e);
      throw e;
    }
  }

}
