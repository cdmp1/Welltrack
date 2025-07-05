import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DailyTrackingService } from './daily-tracking.service';


describe('DailyTrackingService', () => {
  let service: DailyTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DailyTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
