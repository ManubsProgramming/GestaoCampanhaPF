const CACHE_NAME =
  "gestao-pf-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./novo-cadastro.html",
  "./pessoas.html",

  "./css/global.css",
  "./css/login.css",

  "./js/api.js",
  "./js/auth.js",
  "./js/login.js",

  "./assets/imagens/prefeitura-icon.png"
];


/* =========================
   INSTALAÇÃO
========================= */

self.addEventListener(
  "install",
  function (event) {
    event.waitUntil(
      caches
        .open(
          CACHE_NAME
        )
        .then(
          function (cache) {
            return cache.addAll(
              STATIC_FILES
            );
          }
        )
    );

    self.skipWaiting();
  }
);


/* =========================
   ATIVAÇÃO
========================= */

self.addEventListener(
  "activate",
  function (event) {
    event.waitUntil(
      caches
        .keys()
        .then(
          function (cacheNames) {
            return Promise.all(
              cacheNames
                .filter(
                  function (
                    cacheName
                  ) {
                    return (
                      cacheName !==
                      CACHE_NAME
                    );
                  }
                )
                .map(
                  function (
                    cacheName
                  ) {
                    return caches.delete(
                      cacheName
                    );
                  }
                )
            );
          }
        )
    );

    self.clients.claim();
  }
);


/* =========================
   REQUISIÇÕES
========================= */

self.addEventListener(
  "fetch",
  function (event) {
    const request =
      event.request;

    /*
     * Por enquanto NÃO armazenamos
     * chamadas da API.
     */
    if (
      request.url.includes(
        "/api/"
      )
    ) {
      return;
    }

    event.respondWith(
      caches
        .match(
          request
        )
        .then(
          function (
            cachedResponse
          ) {
            if (
              cachedResponse
            ) {
              return cachedResponse;
            }

            return fetch(
              request
            );
          }
        )
    );
  }
);