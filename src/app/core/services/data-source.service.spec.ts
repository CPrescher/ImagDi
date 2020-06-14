import { TestBed } from '@angular/core/testing';

import { DataSourceService } from './data-source.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
