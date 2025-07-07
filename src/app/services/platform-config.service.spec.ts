import { TestBed } from '@angular/core/testing';
import { PlatformConfigService } from './platform-config.service';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';


describe('PlatformConfigService', () => {
  let service: PlatformConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformConfigService],
    });
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    service = TestBed.inject(PlatformConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return config with apiUrl and platform', () => {
    const config = service.getConfig();
    expect(config.apiUrl).toBe(environment.apiUrl);
    expect(config.platform).toBe('android');
  });

  it('should return platform as ios when simulated', () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('ios');
    const newService = new PlatformConfigService();
    const config = newService.getConfig();
    expect(config.platform).toBe('ios');
  });
});
