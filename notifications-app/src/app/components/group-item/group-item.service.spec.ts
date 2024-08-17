import { TestBed } from '@angular/core/testing';

import { GroupItemService } from './group-item.service';

describe('GroupItemService', () => {
  let service: GroupItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
