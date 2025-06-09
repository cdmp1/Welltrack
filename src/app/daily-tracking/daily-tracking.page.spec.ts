import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyTrackingPage } from './daily-tracking.page';

describe('DailyTrackingPage', () => {
  let component: DailyTrackingPage;
  let fixture: ComponentFixture<DailyTrackingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyTrackingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
