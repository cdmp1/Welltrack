import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PlatformConfigService {
  private platform: string;
  private isE2E: boolean;

  constructor() {
    this.platform = Capacitor.getPlatform();

    this.isE2E = !!(window as any).Cypress;
  }

  getConfig() {
    return {
      apiUrl: environment.apiUrl,
      platform: this.platform,
      isE2E: this.isE2E,
    };
  }
}
