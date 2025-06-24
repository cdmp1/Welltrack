import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';


@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  standalone: false
})
export class CameraPage implements OnInit {
  imageSource: any;
  constructor() { }

  ngOnInit() {
  }

  takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl
  });

  // image.webPath will contain a path that can be set as an image src.
  // You can access the original file using image.path, which can be
  // passed to the Filesystem API to read the raw data of the image,
  // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
  this.imageSource=image.dataUrl;
};

}
