import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photo: Photo | null = null;

  constructor() {}

  // Tomar una foto con la cámara
  async capturarFoto(): Promise<Photo> {
    const photo: Photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    this.photo = photo;
    return photo;
  }

  // Elegir una imagen desde la galería 
  async elegirDeGaleria(): Promise<Photo> {
    const photo: Photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 100
    });

    this.photo = photo;
    return photo;
  }

  // Obtener la URI de la última imagen
  getPhotoUrl(): string | null {
    return this.photo?.webPath || null;
  }
}
