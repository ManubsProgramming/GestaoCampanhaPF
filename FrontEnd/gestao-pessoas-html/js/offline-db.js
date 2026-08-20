const DB_NAME =
  "gestao-pf-offline";

const DB_VERSION = 1;

const STORES = {
  regioes: "regioes",
  localidades: "localidades",
  ruas: "ruas"
};


function openOfflineDb() {
  return new Promise(
    function (
      resolve,
      reject
    ) {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        function () {
          const db =
            request.result;

          if (
            !db.objectStoreNames
              .contains(
                STORES.regioes
              )
          ) {
            db.createObjectStore(
              STORES.regioes,
              {
                keyPath: "id"
              }
            );
          }

          if (
            !db.objectStoreNames
              .contains(
                STORES.localidades
              )
          ) {
            db.createObjectStore(
              STORES.localidades,
              {
                keyPath: "id"
              }
            );
          }

          if (
            !db.objectStoreNames
              .contains(
                STORES.ruas
              )
          ) {
            db.createObjectStore(
              STORES.ruas,
              {
                keyPath: "id"
              }
            );
          }
        };

      request.onsuccess =
        function () {
          resolve(
            request.result
          );
        };

      request.onerror =
        function () {
          reject(
            request.error
          );
        };
    }
  );
}


async function salvarListaOffline(
  storeName,
  items
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          storeName,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          storeName
        );

      items.forEach(
        function (
          item
        ) {
          store.put(
            item
          );
        }
      );

      transaction.oncomplete =
        function () {
          resolve();
        };

      transaction.onerror =
        function () {
          reject(
            transaction.error
          );
        };
    }
  );
}


async function buscarListaOffline(
  storeName
) {
  const db =
    await openOfflineDb();

  return new Promise(
    function (
      resolve,
      reject
    ) {
      const transaction =
        db.transaction(
          storeName,
          "readonly"
        );

      const store =
        transaction.objectStore(
          storeName
        );

      const request =
        store.getAll();

      request.onsuccess =
        function () {
          resolve(
            request.result || []
          );
        };

      request.onerror =
        function () {
          reject(
            request.error
          );
        };
    }
  );
}