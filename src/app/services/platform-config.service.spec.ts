import { TestBed } from '@angular/core/testing';
import { PlatformConfigService } from './platform-config.service';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';


describe('PlatformConfigService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformConfigService],
    });
  });

  it('should be created', () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    const service = TestBed.inject(PlatformConfigService);
    expect(service).toBeTruthy();
  });

  it('should return config with apiUrl and platform', () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    const service = TestBed.inject(PlatformConfigService);
    const config = service.getConfig();
    expect(config.apiUrl).toBe(environment.apiUrl);
    expect(config.platform).toBe('android');
  });

  it('should return platform as ios when simulated', () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('ios');
    const service = new PlatformConfigService();
    const config = service.getConfig();
    expect(config.platform).toBe('ios');
  });
  
});
