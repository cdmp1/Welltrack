import { TestBed } from '@angular/core/testing';

import { DbTaskService } from './db-task.service';

describe('DbTaskService', () => {
  let service: DbTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
