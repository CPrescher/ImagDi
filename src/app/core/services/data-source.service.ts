import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NumpyLoader } from './numpy-loader';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {

  constructor(
    private http: HttpClient
  ) { }

  getRandomImage() {
    let startTime = performance.now();

    this.http.post(
      'http://127.0.0.1:5000/random',
      {
        x_dim: 2048,
        y_dim: 2048
      }, {responseType: 'arraybuffer'})
      .subscribe( responseData => {
        // console.log(responseData);
        console.log(NumpyLoader.fromArrayBuffer(responseData));
        console.log('took ' + (performance.now() - startTime) + ' ms');
      })
  }
}
