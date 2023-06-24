const player = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const cameraBtn = document.querySelector('.camera-btn');
const captureBtn = document.querySelector('.capture-btn');
const locationBtn = document.querySelector('.location-btn');
const postBtn = document.querySelector('.post-btn');
const cityName = document.querySelector('.city');
const countryName = document.querySelector('.country');
let FD;

captureBtn.disabled = true;

let videoTracks;
let imageCapture;
cameraBtn.addEventListener('click', async () => {
  // checking for support of Camera, Mic, Audio, video etc
  if ('mediaDevices' in navigator) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      videoTracks = stream.getVideoTracks();
      const mediaStreamTrack = stream.getVideoTracks()[0];
      imageCapture = new ImageCapture(mediaStreamTrack);
      player.style.display = 'block';
      player.srcObject = stream;
      captureBtn.disabled = false;
    } catch (error) {
      alert(`${error.name}`);
      console.error(error);
    }
  }
});

captureBtn.addEventListener('click', async () => {
  //   captureBtn.disabled = true;
  const canvasContainer = document.querySelector('.canvas-container');
  //   const normalContainer = document.querySelector('.normal-container');
  //   const normalImg = document.querySelector('.normal-img');

  //   blobContainer.style.display = 'block';
  //   blobContainer.querySelector('h3').innerHTML = 'Blob Image Loading...';
  //   canvasElement.getContext('2d').drawImage(player, 0, 0, 320, 240);
  //   const img = document.querySelector('.blob-image');

  imageCapture
    .grabFrame()
    .then((imageBitmap) => {
      canvasElement.width = imageBitmap.width;
      canvasElement.height = imageBitmap.height;
      canvasElement.getContext('2d').drawImage(imageBitmap, 0, 0);
      const dataURL = canvasElement.toDataURL('image/jpeg', 1.0);
      const blob = dataURItoBlob(dataURL);
      // URL.createObjectURL(It can take blob or file or mediasource)
      const url = URL.createObjectURL(blob);
      console.log({ url });
      const anchor = document.querySelector('.download-image');
      anchor.href = url;
      anchor.download = 'firstimage.jpeg';
      FD = new FormData();
      FD.append('userImage', blob);
      console.log(FD.get('userImage'));
      // var file = new File([blob], 'canvasImage.jpg', { type: 'image/jpeg' });
      // console.log(file);

      //   normalImg.src = dataURL;
      canvasElement.style.display = 'block';
      canvasContainer.style.display = 'block';
      //   normalImg.style.display = 'block';
      //   normalContainer.style.display = 'block';
    })
    .catch((error) => console.error('grabFrame() error:', error));

  //   imageCapture
  //     .takePhoto()
  //     .then(
  //       (blob) => {
  //         img.src = URL.createObjectURL(blob);
  //         img.onload = () => {
  //           URL.revokeObjectURL(this.src);
  //           img.style.display = 'block';
  //         };
  //         blobContainer.querySelector('h3').innerHTML =
  //           'Blob Image(More resolution Image)';

  //         videoTracks.forEach((track) => track.stop());
  //         player.style.display = 'none';
  //       },
  //       'image/jpeg',
  //       0.5
  //     )
  //     .catch((error) => console.error('takePhoto() error:', error));
});

// function dataURLtoBlob(dataurl) {
//   var arr = dataurl.split(','),
//     mime = arr[0].match(/:(.*?);/)[1],
//     bstr = atob(arr[1]),
//     n = bstr.length,
//     u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new Blob([u8arr], { type: mime });
// }

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}

locationBtn.addEventListener('click', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        console.log({ latitude, longitude });
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const { countryName: country, city } = await fetch(url).then((resp) =>
          resp.json()
        );
        cityName.innerHTML = `City: <b>${city}</b>`;
        countryName.innerHTML = `City: <b>${country}</b>`;
        FD.append('countryName', country);
        FD.append('cityName', city);
        console.log(FD);
      },
      (error) => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
});

postBtn.addEventListener('click', () => {
  url = 'https://pwa-practice-49ad4-default-rtdb.firebaseio.com/posts.json';
  const plainFormData = Object.fromEntries(FD.entries());
  const formDataJsonString = JSON.stringify(plainFormData);
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formDataJsonString),
  })
    .then((resp) => resp.json())
    .then((data) => console.log(data));
});
