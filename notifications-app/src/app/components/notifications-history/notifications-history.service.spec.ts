import { TestBed } from '@angular/core/testing';

import { NotificationsHistoryService } from './notifications-history.service';

describe('NotificationsHistoryService', () => {
  let service: NotificationsHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
