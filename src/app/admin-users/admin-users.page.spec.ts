import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminUsersPage } from './admin-users.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../services/user.service'; 



describe('AdminUsersPage', () => {
  let component: AdminUsersPage;
  let fixture: ComponentFixture<AdminUsersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminUsersPage],
      imports: [HttpClientTestingModule], 
      providers: [UserService] 
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
