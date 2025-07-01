import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


@Injectable({ providedIn: 'root' })
export class StorageService {

  constructor() {}

  async set(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error(`Error al guardar "${key}"`, error);
    }
  }

  // Obtiene un valor del almacenamiento, y lo parsea desde JSON
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error(`Error al obtener "${key}"`, error);
      return null;
    }
  }

  // Elimina una clave del almacenamiento
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error al eliminar "${key}"`, error);
    }
  }

  // Limpia todo el almacenamiento
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error al limpiar el almacenamiento', error);
    }
  }

  // Verifica si existe un valor para la clave dada
  async has(key: string): Promise<boolean> {
    try {
      const result = await Preferences.get({ key });
      return !!result.value;
    } catch (error) {
      console.error(`Error al verificar existencia de "${key}"`, error);
      return false;
    }
  }
  
}

