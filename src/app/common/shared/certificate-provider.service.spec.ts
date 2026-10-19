import { TestBed } from '@angular/core/testing';

import { CertificateProviderService } from './certificate-provider.service';

describe('CertificateProviderService', () => {
  let service: CertificateProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertificateProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
