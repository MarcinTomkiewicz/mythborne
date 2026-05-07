import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { EMPTY_FORMULA_ADMIN_DATA } from '../../types/formula-admin-view.types';
import { FormulaService } from '../formula/formula';
import { PvpTravelTimingAdmin } from './pvp-travel-timing-admin';

describe('PvpTravelTimingAdmin', () => {
  let service: PvpTravelTimingAdmin;
  let formulas: jasmine.SpyObj<FormulaService>;

  beforeEach(() => {
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
    ]);
    formulas.getAdminData.and.returnValue(of(EMPTY_FORMULA_ADMIN_DATA));

    TestBed.configureTestingModule({
      providers: [
        PvpTravelTimingAdmin,
        { provide: FormulaService, useValue: formulas },
      ],
    });

    service = TestBed.inject(PvpTravelTimingAdmin);
  });

  it('loads travel timing data through the formula admin read model', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data).toBe(EMPTY_FORMULA_ADMIN_DATA);
    expect(formulas.getAdminData).toHaveBeenCalled();
  });
});
