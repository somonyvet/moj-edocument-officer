import { TestBed } from '@angular/core/testing';

import { EndPointService } from './end-point.service';

describe('EndPointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EndPointService = TestBed.get(EndPointService);
    expect(service).toBeTruthy();
  });
});
