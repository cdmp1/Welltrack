import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PlatformConfigService {
  private platform: string;

  constructor() {
    this.platform = Capacitor.getPlatform(); 
  }

  getConfig() {
    return {
      apiUrl: environment.apiUrl,
      platform: this.platform,
    };
  }
}
