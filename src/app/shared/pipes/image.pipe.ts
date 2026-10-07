import { Pipe, PipeTransform } from '@angular/core';
import { IUserPined } from 'src/app/interfaces/document/document.interface';

@Pipe({
    name: 'removeImgWhiteSpace',
    standalone: false
})
export class removeImgWhiteSpacePipe implements PipeTransform {
  transform(imgUrl: string):any {

    if(imgUrl){

      return new Promise((resolve, reject) => {
        let imgData:any;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.setAttribute("crossOrigin", "anonymous");
        img.src = imgUrl;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = img.height;
          canvas.width = img.width;
          ctx.fillStyle = "transparent";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(cropImage(ctx, img, canvas));
          // imgData = await cropImage(ctx, img, canvas);
          // console.log('imgData',imgData);

        };
      })
      
      // console.log('imgData',imgData);
      // return imgData
    }
    return null;
  }

}


export function cropImage(ctx, img, canvas) {
  return new Promise((resolve, reject) => {
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    const top = scanY(true, data, img);
    const bottom = scanY(false, data, img);
    const left = scanX(true, data, img);
    const right = scanX(false, data, img);

    const new_width = right - left;
    const new_height = bottom - top;

    canvas.width = new_width;
    canvas.height = new_height;

    ctx.drawImage(img, left, top, new_width, new_height, 0, 0, new_width, new_height);
    resolve(canvas.toDataURL('image/png'));
    img.onerror = error => reject(error);
  })
}

// get pixel RGB data:
export function getRGB(x, y, data, image) {
  return {
    red: data[((image.width * y) + x) * 4],
    green: data[((image.width * y) + x) * 4 + 1],
    blue: data[((image.width * y) + x) * 4 + 2]
  };
}

// check if pixel is white:
export function isEmpty(rgb) {
  return rgb.red >= 250 && rgb.green >= 250 && rgb.blue >= 250;
}

// scan top and bottom edges of image:
export function scanY(top, data, image) {
  var offset = (top) ? 1 : -1;

  for (var y = ((top) ? 0 : image.height - 1); ((top) ? (y < image.height) : (y > -1)); y += offset) {
    for (var x = 0; x < image.width; x++) {
      if (!isEmpty(getRGB(x, y, data, image))) {
        return y;
      }
    }
  }
  return null;
}

// scan left and right edges of image:
export function scanX(left, data, image) {
  var offset = (left) ? 1 : -1;

  for (var x = ((left) ? 0 : image.width - 1); ((left) ? (x < image.width) : (x > -1)); x += offset) {
    for (var y = 0; y < image.height; y++) {
      if (!isEmpty(getRGB(x, y, data, image))) {
        return x;
      }
    }
  }
  return null;
}
