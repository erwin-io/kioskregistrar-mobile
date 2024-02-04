import { TestBed } from '@angular/core/testing';

import { UserOneSignalSubscriptionService } from './user-one-signal-subscription.service';

describe('UserOneSignalSubscriptionService', () => {
  let service: UserOneSignalSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserOneSignalSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
