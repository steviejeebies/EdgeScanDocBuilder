'use strict';

// The point of this file is just a quick/lazy way of
// uploading images, since FreshDesk doesn't support
// uploading images through their API. Edgescan may not
// want the images from their documentation
// on a different/public site, which means this file
// is likely a temporary fix, hence the quick/lazy

const glob = require('glob');
const imgbbUploader = require('imgbb-uploader');

// this is just for a throwaway account, 0 private
// info on it, doesn't matter if token is public on GitHub
const imgBBToken = '3d083719235d5d9fb11ec9cf902fb954';

let fileTypes = 'gif,jpeg,jpg,tiff,png,bmp,GIF,JPEG,JPG,TIFF,PNG,BMP';

async function uploadImages(directory, imageCache) {

  let imageLocations = glob.sync(`${directory}/**/*.{${fileTypes}}`);

  // If the image is already in the cache, then we need to remove
  // it from imageLocations, since we don't want to reupload it for no
  // reason. When an image is inserted into the cache, the directory
  // string is removed, hence the awkward replace() call below.


  console.log(imageLocations);
  console.log(imageCache);

  // return Promise.allSettled(
  //   imageLocations.map(image =>
  //     imgbbUploader(imgBBToken, image,
  //     )))
  //   .then(results => {
  //     results.forEach((result, num) => {
  //       if (result.status === 'fulfilled') {
  //         let link = imageLocations[num].replace(directory + '/', '');
  //         imageCache[link] = result.value.image.url;
  //       }
  //       if (result.status === 'rejected') {
  //         console.log(
  //           `In images.js: Image ${imageLocations[num]} was rejected by ImgBB`,
  //         );
  //       }
  //     });
  //   });
}

module.exports = {
  uploadImages,
};

