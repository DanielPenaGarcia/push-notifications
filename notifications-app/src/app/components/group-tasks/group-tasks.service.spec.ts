import { TestBed } from '@angular/core/testing';

import { GroupTasksService } from './group-tasks.service';

describe('GroupTasksService', () => {
  let service: GroupTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
