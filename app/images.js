'use strict';

// The point of this file is just a quick/lazy way of
// uploading images, since FreshDesk doesn't support
// uploading images through their API. Edgescan may not
// want the images from their documentation
// on a different/public site, which means this file
// is likely a temporary fix.

const glob = require('glob');
const imgbbUploader = require('imgbb-uploader');

// this is just for a throwaway account, doesn't matter
// if token is public on GitHub
const imgBBToken = '3d083719235d5d9fb11ec9cf902fb954';

let fileTypes = 'gif,jpeg,jpg,tiff,png,bmp,GIF,JPEG,JPG,TIFF,PNG,BMP';

async function uploadImages(directory) {
  let imageLinks = {};

  let imageLocations = glob.sync(`${directory}/**/*.{${fileTypes}}`);
  await Promise.allSettled(
    imageLocations.map(image =>
      imgbbUploader(imgBBToken, image,
      )))
    .then(results => {
      results.forEach((result, num) => {
        if (result.status === 'fulfilled') {
          let link = imageLocations[num].replace(directory + '/', '');
          imageLinks[link] = result.value.image.url;
        }
        if (result.status === 'rejected') {
          console.log(
            `In images.js: Image ${imageLocations[num]} was rejected by ImgBB`,
          );
        }
      });
    });

  return imageLinks;
}

module.exports = {
  uploadImages,
};

