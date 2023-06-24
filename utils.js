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
