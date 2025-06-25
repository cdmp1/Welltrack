import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatus = new BehaviorSubject<boolean>(true);

  constructor() {
    this.initializeNetworkEvents();
    this.checkInitialStatus();
  }

  private async checkInitialStatus() {
    const status = await Network.getStatus();
    this.networkStatus.next(status.connected);
  }

  private initializeNetworkEvents() {
    Network.addListener('networkStatusChange', status => {
      console.log('Estado de red cambiado:', status.connected);
      this.networkStatus.next(status.connected);
    });
  }

  public getNetworkStatus() {
    return this.networkStatus.asObservable(); 
  }

  public isOnline(): boolean {
    return this.networkStatus.value;
  }
}
