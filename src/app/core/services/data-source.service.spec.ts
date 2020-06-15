import { TestBed } from '@angular/core/testing';

import { DataSourceService } from './data-source.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import ndarray = require('ndarray');

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

  it('should be fast', () => {
    let t0 = new Date();
    // let new_data = service.make2dArray(2048, 2048);
    // new_data.forEach((x)=> x.fill(1));
    // let t1 = new Date();
    // console.log(t1.getTime()-t0.getTime());
    //
    // // let newData2 = service.createOnes(2048, 2048);
    // let newdata = Float32Array
    // let t2 = new Date();
    // console.log(t2.getTime()-t1.getTime());

    // let lutData = service.applyLut2(new_data);
    // let t3 = new Date()
    // console.log(t3.getTime()-t2.getTime())

  })
});
