import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.page.html',
  styleUrls: ['./pdf-viewer.page.scss'],
})
export class PdfViewerPage implements OnInit {
  url = '';
  name = '';
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
