import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Files } from 'src/app/model/files';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImageViewerPage implements OnInit {
  file: Files;
  loaded = false;
  constructor(
    private modalCtrl: ModalController,
    private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      this.close();
    });
  }

  ngOnInit() {
  }
  profilePicErrorHandler(event) {
    event.target.src = '../../../assets/img/error_black.png';
  }
  async close() {
    await this.modalCtrl.dismiss();
  }

}
