import { TestBed } from '@angular/core/testing';
import { ImageHistogram } from './image-histogram';
import { DataSourceService } from '../core/services';
import { HttpClientModule } from '@angular/common/http';


describe('ImageHistogram', () => {
  let imageHistogram: ImageHistogram;
  let dataService: DataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [DataSourceService]
    });
    dataService = TestBed.get(DataSourceService);
    imageHistogram = new ImageHistogram("body");
  })

  it('should calculate histogram', () => {
    const dim = 2048;
    const bins = 5000;
    const image = dataService.createRandomDetectorImage(dim, dim);
    const t1 = Date.now()
    const hist = imageHistogram.calculateHistogram(image, bins);
    console.log(Date.now()-t1);
    expect(hist.data.length).toBe(bins);
    // expect(hist.data.reduce((a, b) => a + b, 0)).toBe(dim * dim);
    expect(hist.binCenters.length).toBe(bins);
    expect(hist.binCenters[0]).toBe(hist.min + hist.binSize / 2);
    expect(hist.binCenters[bins-1] - (hist.max - hist.binSize / 2)).toBeLessThan(1e-10);
  });
});
