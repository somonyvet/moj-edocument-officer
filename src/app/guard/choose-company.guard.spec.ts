import { TestBed, async, inject } from '@angular/core/testing';

import { ChooseCompanyGuard } from './choose-company.guard';

describe('ChooseCompanyGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChooseCompanyGuard]
    });
  });

  it('should ...', inject([ChooseCompanyGuard], (guard: ChooseCompanyGuard) => {
    expect(guard).toBeTruthy();
  }));
});
