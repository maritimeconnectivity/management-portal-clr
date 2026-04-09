import { TestBed } from '@angular/core/testing';

import { SignatureProviderService } from './signature-provider.service';

describe('SignatureProviderService', () => {
  let service: SignatureProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignatureProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
