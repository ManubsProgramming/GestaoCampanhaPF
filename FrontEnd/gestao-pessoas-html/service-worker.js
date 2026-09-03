const CACHE_NAME = "gestao-pf-v16";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./novo-cadastro.html",
  "./pessoas.html",

  "./css/global.css?v=13",
  "./css/login.css",
  "./css/painel.css?v=13",
  "./css/novo-cadastro.css?v=15",
  "./css/modal.css?v=13",

  "./js/api.js?v=14",
  "./js/auth.js?v=14",
  "./js/modal.js?v=14",
  "./js/novo-cadastro.js?v=15",
  "./js/pwa.js?v=14",
  "./js/offline.js?v=14",

  "./assets/imagens/prefeitura-icon.png"
];


/* =========================
   INSTALAÇÃO
========================= */

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(STATIC_FILES);
      })
  );

  self.skipWaiting();
});


/* =========================
   ATIVAÇÃO
========================= */

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (cacheName) {
              return cacheName !== CACHE_NAME;
            })
            .map(function (cacheName) {
              return caches.delete(cacheName);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});


/* =========================
   REQUISIÇÕES
========================= */

self.addEventListener("fetch", function (event) {
  const request = event.request;

  /*
   * Não interfere em requisições
   * diferentes de GET.
   */
  if (request.method !== "GET") {
    return;
  }

  /*
   * Nunca armazenar chamadas da API.
   */
  if (request.url.includes("/api/")) {
    return;
  }

  const url = new URL(request.url);


  /*
   * PÁGINAS HTML
   *
   * NETWORK FIRST.
   */
  if (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(request)
        .then(function (networkResponse) {
          if (
            networkResponse &&
            networkResponse.ok
          ) {
            const responseClone =
              networkResponse.clone();

            caches
              .open(CACHE_NAME)
              .then(function (cache) {
                cache.put(
                  request,
                  responseClone
                );
              });
          }

          return networkResponse;
        })
        .catch(function () {
          return caches
            .match(request)
            .then(function (cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }

              return caches.match(
                "./index.html"
              );
            });
        })
    );

    return;
  }


  /*
   * CSS E JAVASCRIPT
   *
   * NETWORK FIRST.
   */
  if (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      fetch(request)
        .then(function (networkResponse) {
          if (
            networkResponse &&
            networkResponse.ok
          ) {
            const responseClone =
              networkResponse.clone();

            caches
              .open(CACHE_NAME)
              .then(function (cache) {
                cache.put(
                  request,
                  responseClone
                );
              });
          }

          return networkResponse;
        })
        .catch(function () {
          return caches.match(
            request
          );
        })
    );

    return;
  }


  /*
   * DEMAIS ARQUIVOS ESTÁTICOS
   *
   * CACHE FIRST.
   */
  event.respondWith(
    caches
      .match(request)
      .then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(function (networkResponse) {
            if (
              !networkResponse ||
              !networkResponse.ok
            ) {
              return networkResponse;
            }

            const responseClone =
              networkResponse.clone();

            caches
              .open(CACHE_NAME)
              .then(function (cache) {
                cache.put(
                  request,
                  responseClone
                );
              });

            return networkResponse;
          });
      })
  );
});