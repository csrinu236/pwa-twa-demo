importScripts('/idb.js');
importScripts('/utils.js');

const STATIC = 'static_v1';
const DYNAMIC = 'dynamic_v1';
const MANUAL_SAVE = 'manual_save_v1';

const ONLY_FETCH = ['http://localhost:8888/logo.jpg'];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] installing Service Worker...', e);
  // don't offload this task and go to bottom first cache
  // all these pages and then go for activating service worker

  e.waitUntil(
    // caches store key value pairs or to add new cache details
    caches.open(STATIC).then((cache) => {
      console.log('[Service Worker] Pre caching app shell');
      cache.add('/index.html');
      cache.add('/about.html');
      cache.add('/idb.js');
      cache.add('/offline.html');
      cache.add('/main.css');
      cache.add('/app.js');
    })
  );

  // console.log('Skiping Wating...');
  // self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] activating Service Worker', e);
  console.log(
    '[swReg] in activate event for checking scope of service worker',
    self.registration
  );
  caches.keys().then((keyList) => {
    return Promise.all(
      keyList.map((eachKey) => {
        if (
          eachKey !== STATIC &&
          eachKey !== DYNAMIC &&
          eachKey !== MANUAL_SAVE
        ) {
          // we will soon find a way to automatically name newer cache
          // and deleting older cache using older cache name.
          console.log('[Service Worker] removing older cache', { eachKey });
          return caches.delete(eachKey);
        }
      })
    );
  });
  // When SW installed & activated for the first time, it does have any scope or
  // clients(pages), it does not know which page fetch requests to be intercepted.
  // You can take control of uncontrolled clients by calling clients.claim()
  // within your service worker once it's activated.
  return self.clients.claim();
});

self.clients.matchAll().then(function (clients) {
  clients.forEach(function (client) {
    console.log({ client });
  });
});

self.addEventListener('fetch', (e) => {
  console.log('1)[Service Worker] Request in Intercepted, Captain...!', e);

  const url = new URL(e.request.url);
  // if (url.pathname === '/api/dbdata') {
  //   return e.respondWith(fetch(e.request));
  // }
  if (e.request.method === 'POST' && url.pathname === '/share-target.html') {
    // The URL constructor is a built-in JavaScript object that provides a convenient way to parse and manipulate URLs. By passing a URL string as a parameter to the URL constructor, you can create a URL object that exposes various properties and methods to access and modify different parts of the URL.
    // Once you have created a URL object, you can use its properties and methods to retrieve information about the URL, such as the protocol, hostname, port, path, query parameters, and more. You can also modify these components if needed.

    // console.log({ url, pathname: url.pathname });
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    e.respondWith(
      (async () => {
        const formData = await e.request.formData();
        // The formData() method is used to asynchronously parse the body of
        // the request as a FormData object. It allows you to access the form
        // data sent in the POST request payload.
        const link = formData.get('link') || '';
        document.querySelector('.url').innerHTML = link;
        // parsedUrl.searchParams.get('url');
        // const responseUrl = await saveBookmark(link);
        const responseUrl = '/share-target.html';
        // 303 status code is for redirecting a POST request with body
        // into a GET request with body key-value pairs as query parameters
        return Response.redirect(responseUrl, 303);
      })()
    );
  }

  console.log('request===>', e.request.url);
  if (ONLY_FETCH.includes(e.request.url)) {
    return e.respondWith(fetch(e.request));
  }

  const urls = ['http://localhost:8888/api/locations-db'];

  if (urls.includes(e.request.url)) {
    // this case cache first & then network later
    // Part2, fetch interceptor of Part 1(post.js)
    return e.respondWith(
      fetch(e.request).then((resp) => {
        const clonedResp = resp.clone();
        clonedResp.json().then((data) => {
          for (const key in data) {
            const finalPut = {
              ...data[key],
              id: new Date().getTime().toString(),
            };
            console.log(finalPut);
            writedata('posts', finalPut);
            // dbPromise.then((db) => {
            //   const tx = db.transaction('posts', 'readwrite');
            //   const store = tx.objectStore('posts');
            //   store.put(finalPut);
            //   return tx.complete;
            // });
          }
        });
        return resp;
      })
    );

    // CHECK THE NETWORK TAB AND SEE REMAINING FILES
    // ARE SERVED FROM SW, BUT NOT THIS URL.
  } else {
    // previous as usual case either cache or network
    e.respondWith(
      caches.match(e.request).then((resp) => {
        if (resp) {
          // if we found the cached response, serve it.
          // if no cache found, get it from network.
          console.log('2) From Cache ', resp);
          return resp;
        } else {
          return fetch(e.request)
            .then((fetchResp) => {
              // before serving network response, cache it and then serve it
              return caches.open(DYNAMIC).then((cache) => {
                cache.put(e.request.url, fetchResp.clone());
                console.log('2) From Fetch ', fetchResp);
                return fetchResp; // we can also return fetchResp.json()
                // so that js files don't need to do resp.json()
              });
            })
            .catch((err) => {
              // Here we should navigate user to offline.html page
              // We need to navigate the user to the fallback.html page when
              // the user is offline AND trying to access any html
              // page which has NOT been cached yet (about.html)

              // way-1 (recommended)
              return caches.open(STATIC).then((cache) => {
                // it will return offline.html file if the match found for about.html page
                // return cache.match('/offline.html');
                // it can also lead to another problem, if any http request fails
                // we will get html page instead of json. So we should send cached
                // response based on url route.
                if (e.request.headers.get('accept').includes('text/html')) {
                  // Here you can also add fallback images for image requests
                  return cache.match('/offline.html').then((cacheFound) => {
                    return cacheFound;
                  });
                  // we can also send this without opening static caches files
                }
              });
              // way-2
              // now it will search all the available caches(STATIC, DYNAMIC, MANUAL_SAVE)
              // instead of only STATIC
              if (e.request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html').then((cacheFound) => {
                  return cacheFound;
                });
              }
            });
        }
      })
    );
  }
});

self.addEventListener('notificationclick', (e) => {
  console.log(e);
  const notification = e.notification;
  const action = e.action;
  console.log(notification);

  // 3 cases
  // 1) Directly click on notification
  // 2) Click on Confirm
  // 3) Click on Cancel
  // check console.log(notification) in each case, check the timestamp as well

  if (action === 'confirm') {
    //do someting
    notification.close(); // we should close notification icon after
    // we click any option confirm/cancel.
    // When clicked on any option, we should open /about.html directly on the broswer,
    // we will check this situation later.
  } else {
    console.log(action);
    // if clicked anywhere else on notification other than confirm or cancel,
    // we can open the app either existing one if already opened or
    // open new one if not opened already
    e.waitUntil(
      clients.matchAll().then((clients) => {
        // checking if already opened window of app
        const openedClient = clients.find(
          (c) => c.visibilityState === 'visible'
        );
        if (openedClient) {
          // if window found open it and focus it
          openedClient.navigate(
            'https://pwa-practice-123.netlify.app/files.html'
          );
          // actually we are hard coding this local host url,
          // lets say we have a blog post notification, we should
          // open that page directly, we should send this url
          // from back end itself.
          // Sol: we should set url in the payload of backend response
          // url is available in 'push' event, there we open notification
          // with a data propety to send any metadata
          // openedClient.navigate(notification.data.url);
          openedClient.focus();
        } else {
          // if not found
          openedClient.openWindow(
            'https://pwa-practice-123.netlify.app/files.html'
          );
          // openedClient.navigate(notification.data.url);
        }
      })
    );
    notification.close();
    // we also have notification close event
  }
});

self.addEventListener('notificationclose', (e) => {
  console.log('Notification was closed...', e);
  console.log(
    'You can send Data Analytics when notification was closed',
    'how long user keep the notification on the banner based on',
    'timestamp between recieving notification and closing notification'
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-new-posts') {
    console.log('[SYNC event CB into the action...]');
    e.waitUntil(
      readAllData('offline-posts').then((data) => {
        for (let i = 0; i < data.length; i++) {
          // const url = 'https://pwa-practice-49ad4-default-rtdb.firebaseio.com/posts.json';
          // const url = '/api/dbdata';
          const url = '/api/locations-db';
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              postid: Number(data[i].id), // don't send 'id':'value',
              // coz airtable by default generats an ID and it may clash
              city: data[i].city,
              country: data[i].country,
              language: data[i].language,
            }),
            mode: 'no-cors',
          })
            .then((resp) => {
              // self.postMessage({ data: 'POST MESSAGE FROM SERVICE WORKER' });

              // Send a message to the active clients
              // self.clients.matchAll().then(function (clients) {
              //   clients.forEach(function (client) {
              //     client.postMessage({
              //       data: 'Hello from the service worker!',
              //     });
              //   });
              // });

              if (resp.ok) {
                deleteItemFromDB('offline-posts', data[i].id);
                self.clients.matchAll().then(function (clients) {
                  clients.forEach(function (client) {
                    console.log({ client });
                    client.postMessage({
                      data: 'successfully send DATA from Sync Event',
                    });
                  });
                });
                // console.log('Successfully send DATA from Sync');
                // clean indexedDB
              }
            })
            .catch((err) => console.error('Error...', err));
        }
      })
    );
  }
});

self.addEventListener('push', (e) => {
  let payLoad = null;
  if (e.data) {
    payLoad = e.data.json();
    console.log(payLoad);
  }

  options = {
    content: payLoad.content || 'Fallback Post Added',
    body: payLoad.body || 'Fallback successfully subscribed',
    icon: '/icons/manifest-icon-192.maskable.png',
    image: '/icons/manifest-icon-512.maskable.png',
    dir: 'ltr',
    lang: 'en-IN',
    vibrate: [200, 100, 300],
    badge: '/icons/manifest-icon-192.maskable.png',
  };

  console.log('BEFORE THIS');
  e.waitUntil(
    self.registration
      .showNotification(payLoad.title, options)
      .catch((error) => {
        console.error('Error displaying notification:', error);
      })
  );
});

// self.addEventListener('fetch', (e) => {
//   return e.respondWith(
//     // caches.match(e.request) returns a promise
//     // Caching Dynamic Files(like html,css,js,image files) VS Caching Dynamic Content(users
//     // post request data)

//     // caches.match(e.request) will search for all caches
//     // irrespective of cache names static/dynamic/static-v1/dynamic-v1
//     // so we should clear old caches otherwise those files from older cache
//     // are served because of caches.match(e.request), we clear the older cache
//     // in activate event listener of service worker.
//     caches.match(e.request).then((foundCache) => {
//       if (foundCache) {
//         return foundCache;
//       } else {
//         return fetch(e.request).then((resp) => {
//           const clonedResp = resp.clone();
//           caches.open('dynamic').then((cacheObj) => {
//             cacheObj.put(e.request.url, clonedResp);
//             // key is url, value is actual file (like app.js)
//             // localhost:8080/app.js is the key and actual app.js file is the value
//             // cache.add('/index.html') same is the case with static files
//             // localhost:8080/index.html is the key and actual index.html file is the value
//             return resp;
//           });
//         });
//       }
//     })
//   );
// });
