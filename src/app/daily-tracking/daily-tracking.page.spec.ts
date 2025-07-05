import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyTrackingPage } from './daily-tracking.page';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { DailyTrackingService } from '../services/daily-tracking.service';


describe('DailyTrackingPage', () => {
  let component: DailyTrackingPage;
  let fixture: ComponentFixture<DailyTrackingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DailyTrackingPage],
      imports: [HttpClientTestingModule], 
      providers: [DailyTrackingService]   
    }).compileComponents();

    fixture = TestBed.createComponent(DailyTrackingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
