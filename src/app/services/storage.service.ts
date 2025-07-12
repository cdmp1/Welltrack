import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment'; 


@Injectable({ providedIn: 'root' })
export class StorageService {

  constructor() {}

  async set(key: string, value: any): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (environment.e2e) {
        localStorage.setItem(key, serialized);
      } else {
        await Preferences.set({ key, value: serialized });
      }
    } catch (error) {
      console.error(`Error al guardar "${key}"`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (environment.e2e) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } else {
        const result = await Preferences.get({ key });
        return result.value ? JSON.parse(result.value) : null;
      }
    } catch (error) {
      console.error(`Error al obtener "${key}"`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (environment.e2e) {
        localStorage.removeItem(key);
      } else {
        await Preferences.remove({ key });
      }
    } catch (error) {
      console.error(`Error al eliminar "${key}"`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (environment.e2e) {
        localStorage.clear();
      } else {
        await Preferences.clear();
      }
    } catch (error) {
      console.error('Error al limpiar el almacenamiento', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      if (environment.e2e) {
        return !!localStorage.getItem(key);
      } else {
        const result = await Preferences.get({ key });
        return !!result.value;
      }
    } catch (error) {
      console.error(`Error al verificar existencia de "${key}"`, error);
      return false;
    }
  }

}
