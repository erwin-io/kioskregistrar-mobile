import { TestBed } from '@angular/core/testing';

import { OneSignalNotificationService } from './one-signal-notification.service';

describe('OneSignalNotificationService', () => {
  let service: OneSignalNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneSignalNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
