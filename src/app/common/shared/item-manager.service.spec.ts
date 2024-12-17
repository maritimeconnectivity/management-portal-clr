import { TestBed } from '@angular/core/testing';

import { ItemManagerService } from './item-manager.service';

describe('ItemManagerService', () => {
  let service: ItemManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
