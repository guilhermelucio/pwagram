// (name, version, callback)
const dbPromise = idb.open('posts-store', 1, db => {
    /**
     * Creating a store with a name
     * keyPath will be used to retrieve information using the name of the key
     * that later will be used to retrieve the data.
     * For example, if objects were passed with an `id`, those ids can be used to find
     * the objects
     */
    if(!db.objectsStoreNames || !db.objectsStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
    }
    if(!db.objectsStoreNames || !db.objectsStoreNames.contains('sync-posts')) {
        console.log('should create a new db');
        db.createObjectStore('sync-posts', { keyPath: 'id' });
    }
});

function writeData(store, data) {
    return dbPromise.then(db => {
        const transaction = db.transaction(store, 'readwrite');
        const objectStore = transaction.objectStore(store);
        objectStore.put(data);
        return transaction.complete;
    });
}

function readAllData(store) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(store, 'readonly');
            const objectStore = transaction.objectStore(store);
            return objectStore.getAll();
        });
}

function clearData(store) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(store, 'readwrite');
            const objectStore = transaction.objectStore(store);
            objectStore.clear();
            return transaction.complete;
        });
}

function deleteItem(store, id) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(store, 'readwrite');
            const objectStore = transaction.objectStore(store);
            objectStore.delete(id);
            return transaction.complete;
        });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
