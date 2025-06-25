import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Platform } from '@ionic/angular';
import { User } from '../models/user.model';
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
    await this.platform.ready();

    this.sqliteConn = new SQLiteConnection(CapacitorSQLite);

    this.db = await this.sqliteConn.createConnection(
      'welltrackdb',
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS user_offline (
        id INTEGER PRIMARY KEY,
        usuario TEXT,
        password TEXT,
        nombre TEXT,
        apellidop TEXT,
        apellidom TEXT,
        email TEXT,
        sincronizado INTEGER DEFAULT 0
      )
    `);

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
  }

  // USER OFFLINE
  async saveUserOffline(user: User): Promise<number> {
    if (!this.isReady) await this.init();
    const tempId = Date.now();
    user.id = tempId;

    await this.db.run(
      `INSERT INTO user_offline (id, usuario, password, nombre, apellidop, apellidom, email, sincronizado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [tempId, user.usuario, user.password, user.nombre, user.apellidop, user.apellidom, user.email]
    );

    return tempId;
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.isReady) await this.init();
    const result = await this.db.query(`SELECT * FROM user_offline WHERE id = ?`, [id]);
    const row = result.values?.[0];
    return row ? {
      id: row.id,
      usuario: row.usuario,
      password: row.password,
      nombre: row.nombre,
      apellidop: row.apellidop,
      apellidom: row.apellidom,
      email: row.email
    } : null;
  }

  async getUserByCredenciales(usuario: string, password: string): Promise<User | null> {
    if (!this.isReady) await this.init();
    const result = await this.db.query(
      `SELECT * FROM user_offline WHERE usuario = ? AND password = ?`,
      [usuario, password]
    );
    const row = result.values?.[0];
    return row ? {
      id: row.id,
      usuario: row.usuario,
      password: row.password,
      nombre: row.nombre,
      apellidop: row.apellidop,
      apellidom: row.apellidom,
      email: row.email
    } : null;
  }

  // USER INFO OFFLINE
  async saveUserInfoOffline(userInfo: UserInfo): Promise<void> {
    if (!this.isReady) await this.init();
    const fechaIso = new Date(userInfo.fechaNacimiento).toISOString();

    await this.db.run(
      `INSERT INTO user_info_offline (userId, genero, objetivo, fechaNacimiento, recibirNotificaciones, sincronizado)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userInfo.userId, userInfo.genero, userInfo.objetivo, fechaIso, userInfo.recibirNotificaciones ? 1 : 0]
    );
  }

  async getPendingUserInfo(): Promise<UserInfo[]> {
    if (!this.isReady) await this.init();
    const result = await this.db.query(`SELECT * FROM user_info_offline WHERE sincronizado = 0`);
    return result.values?.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      genero: row.genero,
      objetivo: row.objetivo,
      fechaNacimiento: new Date(row.fechaNacimiento),
      recibirNotificaciones: row.recibirNotificaciones === 1
    })) ?? [];
  }

  async getPendingUsers(): Promise<User[]> {
    if (!this.isReady) await this.init();
    const res = await this.db.query(`SELECT * FROM user_offline WHERE sincronizado = 0`);
    return res.values?.map((row: any) => ({
      id: row.id,
      usuario: row.usuario,
      password: row.password,
      nombre: row.nombre,
      apellidop: row.apellidop,
      apellidom: row.apellidom,
      email: row.email,
      sincronizado: row.sincronizado === 1
    })) ?? [];
  }

  async updateUserId(tempId: number, newId: number): Promise<void> {
    if (!this.isReady) await this.init();
    await this.db.run(`UPDATE user_offline SET id = ?, sincronizado = 1 WHERE id = ?`, [newId, tempId]);
  }

  async updateUserInfoUserId(tempId: number, newId: number): Promise<void> {
    if (!this.isReady) await this.init();
    await this.db.run(`UPDATE user_info_offline SET userId = ? WHERE userId = ?`, [newId, tempId]);
  }

  async markUserInfoAsSynced(id: number): Promise<void> {
    if (!this.isReady) await this.init();
    await this.db.run(`UPDATE user_info_offline SET sincronizado = 1 WHERE id = ?`, [id]);
  }

  // DAILY TRACKING
  async saveDailyTracking(record: DailyTracking): Promise<void> {
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
  }

  async getDailyTrackingByDate(userId: number, fecha: string): Promise<DailyTracking | null> {
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
  }

  async getAllDailyTracking(userId: number): Promise<DailyTracking[]> {
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
  }

  async getPendingDailyTracking(): Promise<DailyTracking[]> {
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
  }

  async markDailyTrackingAsSynced(id: number): Promise<void> {
    if (!this.isReady) await this.init();
    await this.db.run(`UPDATE daily_tracking SET sincronizado = 1 WHERE id = ?`, [id]);
  }

  async clearSyncedDailyTracking(): Promise<void> {
    if (!this.isReady) await this.init();
    await this.db.run(`DELETE FROM daily_tracking WHERE sincronizado = 1`);
  }
}
