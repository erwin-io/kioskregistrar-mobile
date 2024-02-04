import { TestBed } from '@angular/core/testing';

import { RequestRequirementsService } from './request-requirements.service';

describe('RequestRequirementsService', () => {
  let service: RequestRequirementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestRequirementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
