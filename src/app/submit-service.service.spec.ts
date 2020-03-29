import { TestBed } from '@angular/core/testing';

import { SubmitServiceService } from './submit-service.service';

describe('SubmitServiceService', () => {
  let service: SubmitServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmitServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
