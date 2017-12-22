import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Camera,DatePicker} from 'ionic-native';

@Injectable()
export class CameraService {
  constructor(private _platform: Platform) {
    _platform.ready().then(d=>{
      console.log(navigator.camera);
    }).catch(e=>{
      console.log("error");
    });
  }

  getPicture(options){

    return new Promise((res,rej)=>{
      Camera.getPicture(options).then(imageData => {
        console.log('camera service: taking picture');
              console.log(imageData);
              res(imageData)
      }).catch(()=>{
        rej('')
      });
    });

  }

  cropPicture(image){

    return new Promise((res,rej)=>{
      plugins.crop.promise(image).then(newImageData =>{
        console.log('camera service: cropping picture');
        res(newImageData)
      }).catch(()=>{
        rej('')
      });
    });
  }

}
