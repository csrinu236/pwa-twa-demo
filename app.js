console.warn('Waning something...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

const installBtn = document.querySelector('.install-btn');
const notificationsBtn = document.querySelector('.enable-notifications');
installBtn.disabled = true;
let defferedPromt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallpromt');
  e.preventDefault();

  defferedPromt = e;
  installBtn.disabled = false;

  if (defferedPromt) {
    installBtn.addEventListener('click', () => {
      console.log('CLICKED');
      defferedPromt.prompt();
      defferedPromt.userChoice.then((choiceResult) => {
        // if (choiceResult.outcome === 'accepted') {
        //   console.log('User accepted the install prompt');
        // }
        if (choiceResult.outcome === 'dismissed') {
          console.log('DISMISSED');
        } else {
          console.log('APP ADDED TO HOME SCREEN');
        }
        defferedPromt = null;
      });
    });
  }
});

const fetchBtn = document.querySelector('.fetch-btn');
// This is for manually saved data to cache on demand
const manualSaveBtn = document.querySelector('.manual-save');

fetchBtn.addEventListener('click', async () => {
  const data = await fetch(
    'https://jsonplaceholder.typicode.com/posts?userId=2'
  ).then((resp) => resp.json());
  const DOMSting = data.map(({ title, body }) => {
    return `<div class="card single-post">
            <h4>${title}</h4>
            <p class="mb-0">
              ${body}
            </p>
          </div>`;
  });
  const postsContainer = document.querySelector('.posts-container');
  postsContainer.innerHTML = DOMSting;
});

// This is for manually saved data to cache on demand
manualSaveBtn.addEventListener('click', () => {
  if ('caches' in window) {
    caches.open('manual-save').then((cacheObj) => {
      //   cacheObj.add('/manifest.json');
    });
  }
});

notificationsBtn.addEventListener('click', () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    Notification.requestPermission((result) => {
      console.log('Users choice ', result);
      if (result !== 'granted') {
        console.log('Notifications permission not granted');
      } else {
        displayNotification(); // NOT subscription based, instead simple js click based
        // displaySubBasedNotification(); // It is subscription based, when some one adds a post to backend server,
        // users get notified even if the app is killed.
      }
    });
  }
});

function displayNotification() {
  // You can display notification without service worker as well
  // new Notification('Successfully subscribed [from SW]!', options);

  if ('serviceWorker' in navigator) {
    // we can also set images in notifications like youtube thumbnails
    // we can also set icons in notifications
    // badge is top icon on main desktop screen only showed in android devices
    const options = {
      body: 'working body',
      icon: '/icons/manifest-icon-192.maskable.png',
      image: '/icons/manifest-icon-512.maskable.png',
      dir: 'ltr',
      lang: 'en-IN',
      vibrate: [200, 100, 300],
      badge: '/icons/manifest-icon-192.maskable.png',
      // notifications with same tag actually stack together,
      // tag behaves like id of the notification
      tag: 'pwa-notification',
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/icons/manifest-icon-192.maskable.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/icons/manifest-icon-192.maskable.png',
        },
      ],
    };
    // ready is like alternative of 'install' event,
    // If we want to access Service Worker registration object outside of SW.JS,
    // this method is the way.
    navigator.serviceWorker.ready.then((swReg) => {
      // we are accessing entire SWRegistration object here,
      // we can many things with this object including push notifications
      // This object is alive even if the app is closed
      swReg.showNotification('Successfully subscribed [from SW]!', options);
    });
  }
}

function displaySubBasedNotification() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  let reg;
  navigator.serviceWorker.ready
    .then((swReg) => {
      reg = swReg;
      // Checking for existing subscription on this browser device combination
      return swReg.pushManager.getSubscription();
    })
    .then((sub) => {
      // Checking for existing subscription on this browser device combination
      // A new sub is always created if website is opened in new browser device combination
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '',
      });
      if (sub === null) {
        // Create Subscription
        // to create a subscription, we need public key
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          // public key here
          // private key is stored on backend server only

          // we created subscription, we return it so that it will be sent to
          // backend server via post request
        });
      } else {
        // We already have a subscription, we can enable for
      }
    })
    .then((newSub) => {
      // newSub => a new sub created & returned from previous then block

      return fetch('url', {
        // we return fetch so that we can run another then block or we can also
        // do then here itself.
        method: 'POST',
        body: JSON.stringify(anySub),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => {
        console.log('We successfully subscribed');
        if (res.ok) {
          // we can also send JS displayNotification() to mention subscription
        }
      });
    })
    .catch((err) => {
      // catch error for all the then blocks
      console.log(err);
    });
}

// Push messages from back end server, means firebase cloud function which
// on firebase server
// Steps
// 1) register a subscription on client side and send it on back
//    end Server using post request, as soon as server recieves the request,
//    it will parse the subscription immedietly to send push notifications
//    to all stored subscriptions.
// 2) that stored subscription(on back-end) has endpoint of our browser + device combination
//    to which the server send push notification.
// 3) generate vapid keys & send push notifications => web push package

// self.addEventListener('push', (e) => {
//   // Once backend server sends push notifications, they come here

//   // clearly here SUBSCRIPTION is created with a service worker combination,
//   // and if you unregister the SW then a new SW is created and new SW can't
//   // identifyy push notifications of subscriptions of older service worker,
//   // stored in firebase

//   let data = {
//     title: 'fallback title',
//     content: 'fallback content ',
//     body: 'fallback body',
//     // openUrl: 'fallback open url',
//   };

//   if (e.data) {
//     data = JSON.parse(e.data.json());
//     console.log({ data });
//   }

//   const options = {
//     body: data.content,
//     icon: '/icons/manifest-icon-192.maskable.png',
//     image: '/icons/manifest-icon-512.maskable.png',
//     // data key here is to send any metadata
//     // data: {
//     //   url: data.openUrl,
//     // },
//     // it is not recommended to send images files because webpush, only
//     // accepts string data upto 4kb only, always go with url strings like this.
//   };
//   // to show notification we should find, SWREG object
//   e.waitUntil(self.registration.showNotification(data.title, options));
// });

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const subscribeToPushNotificationsBtn = document.querySelector(
  '.subscribe-to-push-notifications-btn'
);

navigator.serviceWorker.ready.then((swReg) => {
  if (swReg) {
    swReg.pushManager.getSubscription().then((existedSubcription) => {
      console.log(existedSubcription, 'existedSubcription');
      if (existedSubcription === null) {
        subscribeToPushNotificationsBtn.disabled = false;
      }
    });
  }
});

subscribeToPushNotificationsBtn.addEventListener('click', async () => {
  const swReg = await navigator.serviceWorker.ready;
  let existedSubcription = await swReg.pushManager.getSubscription();
  const publicVapidKey =
    'BHkecfr7PKOLoUutqDCfRu_bAcMKVx6OHCtO1807Tl_vHpd-p_L70Hxoyzcuyt-gKB2I1YIr7m2gmBHtVcsNgfM';
  if (existedSubcription === null) {
    existedSubcription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    createModal('Subscribing...');

    const data = await fetch('/api/subscriptions-list', {
      method: 'POST',
      body: JSON.stringify({
        subscription: JSON.stringify(existedSubcription),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((resp) => {
      if (resp.ok) {
        subscribeToPushNotificationsBtn.disabled = true;
        createModal('Subscribed successfully !');
        return resp.json();
      }
    });
    console.log(data);
  } else {
    console.log('ALREADY SUBSCRIBED');
  }
});

function createModal(message) {
  const prevModalIfExisted = document.querySelector('.modal');
  prevModalIfExisted?.remove();
  const MODAL = document.createElement('div');
  MODAL.setAttribute('class', 'modal');
  MODAL.innerHTML = `<div class="modal-content">
              <h3 class="mb-0">${message}</h3>
            </div>`;
  document.body.appendChild(MODAL);
  setTimeout(() => MODAL.remove(), 1500);
}
