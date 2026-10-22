'use strict';

class ImageCustom extends fabric.Image {
  constructor(image, x, y, scaleX, scaleY, name) {
    super(image, { left: x, top: y, name, scaleX, scaleY, className: 'ImageCustom', originX: 'center', originY: 'center' });
  }

  toObject() {
    return { ...super.toObject(), name: this.name, className: this.className };
  }
}

const imageUploadInput = document.querySelector('#image-upload');
imageUploadInput.addEventListener('change', async function () {
  const file = this.files[0];
  this.value = '';
  if (!file || sceneLoading) return;
  if (file.size > 5 * 1024 * 1024) { notify('Choose an image smaller than 5 MiB.', true); return; }
  const sceneAtStart = activeObjects;
  try {
    const source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The image file could not be read.'));
      reader.readAsDataURL(file);
    });
    SceneData.imageSource(source);
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The image could not be decoded.'));
      element.src = source;
    });
    if (image.naturalWidth * image.naturalHeight > SceneData.LIMITS.imagePixels) throw new Error('Choose an image of at most 16 megapixels.');
    if (sceneLoading || sceneAtStart !== activeObjects) throw new Error('The scene changed while the image loaded. Please upload it again.');
    const object = new ImageCustom(image, screenWidth / 2, screenHeight / 2, 1, 1, nextName('Image'));
    if (object.width > 500) object.scaleToWidth(500);
    registerObject(object);
  } catch (error) { notify(`Could not add image: ${error.message}`, true); }
});
