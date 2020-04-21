import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from '../core/services';
import { DataSourceService } from '../core/services/data-source.service';
// import { ElectronService } from '../core/services';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {
  @ViewChild('FileSelectInputDialog') fileSelectInputDialog: ElementRef;


  constructor(
    private electronService: ElectronService,
    private dataSource: DataSourceService) {
  }

  ngOnInit(): void {
  }

  onSubmit(value: any) {
    console.log(value);
  }

  onLoad() {
    if (this.electronService.isElectron) {
      this.electronService.getFileDialog('Please select File').then(
        (result) => {
          const fileName = result.filePaths[0];
          console.log(fileName);
        }
      )
    } else {
      const e: HTMLElement = this.fileSelectInputDialog.nativeElement;
      e.click();
    }
  }

  onFileSelected(event) {
    const file = event.target.files[0]
    console.log(file);
    const data = new FormData();
    data.append("file", file, file.name);
  }

  onRandom() {
    this.dataSource.getRandomImage();
  }
}
