const dbPromise = idb.open('posts-store', 1, (db) => {
  // This callback fn executes whenever version 1->2->3... is changed
  // or for the very first initial loading
  // db we, got access to database object here
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('offline-posts')) {
    db.createObjectStore('offline-posts', { keyPath: 'id' });
  }
  // id is useful to find single object in that databse
});

const writedata = (st, data) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
    // returns a promise so we can chain another then block to do
    // some other asynchronous activities
  });
};

const readAllData = (st) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, 'readonly');
    const store = tx.objectStore(st);
    return store.getAll();
    // returns a promise so we can chain another then block to do
    // some other asynchronous activities
  });
};

const deleteItemFromDB = (st, id) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, 'readwrite');
    const store = tx.objectStore(st);
    store.delete(id);
    return tx.complete;
  });
};

const cities = [
  'London',
  'Paris',
  'New York',
  'Tokyo',
  'Sydney',
  'Rome',
  'Berlin',
  'Moscow',
  'Dubai',
  'Toronto',
  'Madrid',
  'Amsterdam',
  'Barcelona',
  'Beijing',
  'Bangkok',
  'Cairo',
  'Copenhagen',
  'Delhi',
  'Helsinki',
  'Istanbul',
  'Jakarta',
  'Kuala Lumpur',
  'Lisbon',
  'Mexico City',
  'Nairobi',
  'Oslo',
  'Seoul',
  'Stockholm',
  'Vienna',
  'Warsaw',
];

const countries = [
  'United Kingdom',
  'France',
  'United States',
  'Japan',
  'Australia',
  'Italy',
  'Germany',
  'Russia',
  'United Arab Emirates',
  'Canada',
  'Spain',
  'Netherlands',
  'China',
  'Thailand',
  'Egypt',
  'Denmark',
  'India',
  'Finland',
  'Turkey',
  'Indonesia',
  'Malaysia',
  'Portugal',
  'Mexico',
  'Kenya',
  'Norway',
  'South Korea',
  'Sweden',
  'Austria',
  'Poland',
  'Brazil',
];
